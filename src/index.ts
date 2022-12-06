import { EventEmitter } from "events";
import { isString, addEvent, createDiv, getOffset, removeClass, getCss } from "./utils";
import { setglobalStyle } from "./styles";
const hotboxClass = "hot-crop-box";
const createHotClass = (cssText: string) => {
  const style = document.createElement("style");
  style.innerHTML = cssText;
  document.head.appendChild(style);
};
const createHotBox = () => {
  return createDiv({
    className: hotboxClass,
    cssText: `
      width: 225px; height: 64px; display: none;background:#2aa7ff55;
    `,
  });
};
class Slice extends EventEmitter {
  public options: any = {};
  private hotbox: Element = createHotBox();
  private boxIdx = 1;
  private flag = false;
  private addHotFlag = false;
  private dragPointFlag = false;
  private dragAreaFlag = false;
  private currentHotBox: HTMLElement | null = null;
  private newHotBox: Element | null = null;
  private nowclipData: any = [];
  public cliplist: any = [];

  constructor(target: Element | string, options: any) {
    super();
    let element: Element;
    if (isString(target)) {
      element = document.querySelector(target) as Element;
    } else {
      element = target;
    }
    if (!element) {
      throw new Error("请传入正确的选择器" + target + "检查不到");
    }
    this.options = {
      flag: false, // 标记本次鼠标按下
      container: element,
      scale: 1,
      ...options,
    };
    this.initDragArea();
    addEvent(element, "mousedown", this.dragStart.bind(this));
    debugger;
    if (!element.id) {
      element.id = Math.random().toString(36).slice(2);
    }
    createHotClass(setglobalStyle(element.id));
    // element.appendChild(this.hotbox);
  }
  private initDragArea() {
    const dragArea = createDiv({
      className: "hot-area-img",
      cssText: `width: 100%;
      height: 100%;`,
    });
    this.options.container.appendChild(dragArea);
  }

  public dragStart(e: any) {
    this.nowclipData = [];
    e.stopImmediatePropagation();
    // 获取可拖动的范围
    const usearea = getOffset(this.options.container);
    // 画布缩放大小
    const target = e.target;
    const scale = this.options.scale;
    const start = {
      x: e.clientX,
      y: e.clientY,
    };
    this.flag = true;
    // 禁止选择事件
    document.onselectstart = function () {
      return false;
    };
    // 禁止拖动
    document.ondragstart = function () {
      return false;
    };
    // 拖动新建热区
    if (target.classList.contains("hot-area-img")) {
      this.addHotArea(target, start, usearea, scale);
    } else if (this.getBoxContent(target)) {
      this.moveHotArea(target, start, usearea, scale);
    } else if (target.classList.contains("cropper-point")) {
      this.moveCropperPoint(target, start, usearea, scale);
    }
    console.log(target);
    // this.mouseUp();
    addEvent(document, "mouseup", this.mouseUp.bind(this));
  }

  private moveCropperPoint(target: HTMLElement, start: any, usearea: any, scale: number) {
    // 当前热区框
    let currentHotBox = (this.currentHotBox = target.parentElement);
    // let id = currentHotBox.getAttribute("data-id");
    // let selectActive = this.cliplist.find(item => {
    //   if (item.id == id) {
    //     return item;
    //   }
    // });
    // 相对container当前位置
    if (!currentHotBox) return;
    let initAttr = {
      width: currentHotBox.style.width || getCss(currentHotBox, "width"),
      height: currentHotBox.style.height || getCss(currentHotBox, "height"),
      left: currentHotBox.style.left || getCss(currentHotBox, "left"),
      top: currentHotBox.style.top || getCss(currentHotBox, "top"),
      direct: target.dataset.direct || "se",
    };
    let RANGE = 3;
    document.onmousemove = e => {
      // if (selectActive.locked) return;
      if (this.flag && currentHotBox) {
        // 拖动缩放标签
        this.dragPointFlag = true;
        // 鼠标移动距离
        let moveArea = {
          x:
            e.clientX > usearea.left + usearea.width
              ? usearea.left + usearea.width - start.x
              : e.clientX < usearea.left
              ? usearea.left - start.x
              : e.clientX - start.x,
          y:
            e.clientY > usearea.top + usearea.height
              ? usearea.top + usearea.height - start.y
              : e.clientY < usearea.top
              ? usearea.top - start.y
              : e.clientY - start.y,
        };
        moveArea.x = moveArea.x / scale;
        moveArea.y = moveArea.y / scale;
        // console.log("------");
        // console.log("start", start);
        // console.log("client", { x: e.clientX, y: e.clientY });
        // console.log("moveArea", moveArea);
        // console.log("usearea", usearea);
        // console.log("------");
        const { width, height } = this.options.container;
        if (initAttr.direct == "e") {
          let nowW =
            parseInt(initAttr.width) + Math.round(moveArea.x) > width
              ? width
              : width - (parseInt(initAttr.width) + Math.round(moveArea.x)) <= RANGE &&
                e.clientX > start.x
              ? width
              : parseInt(initAttr.width) + Math.round(moveArea.x);
          currentHotBox.style.width = nowW + "px";
          // selectActive.width = nowW;
        }
        if (initAttr.direct == "s") {
          let nowH =
            parseInt(initAttr.height) + Math.round(moveArea.y) > height
              ? height
              : height - (parseInt(initAttr.height) + Math.round(moveArea.y)) <= RANGE &&
                e.clientY > start.Y
              ? height
              : parseInt(initAttr.height) + Math.round(moveArea.y);
          currentHotBox.style.height = nowH + "px";
          // selectActive.height = nowH;
        }
        if (initAttr.direct == "w") {
          let nowW =
            parseInt(initAttr.width) - Math.round(moveArea.x) > width
              ? width
              : width - (parseInt(initAttr.width) - Math.round(moveArea.x)) <= RANGE &&
                e.clientX < start.x
              ? width
              : parseInt(initAttr.width) - Math.round(moveArea.x);
          let offLeft =
            parseInt(initAttr.left) + Math.round(moveArea.x) < 0
              ? 0
              : parseInt(initAttr.left) + Math.round(moveArea.x);
          currentHotBox.style.width = nowW + "px";
          currentHotBox.style.left = offLeft + "px";
          // selectActive.width = nowW;
          // selectActive.left = offLeft;
        }
        if (initAttr.direct == "n") {
          let nowH =
            parseInt(initAttr.height) - Math.round(moveArea.y) > height
              ? height
              : height - (parseInt(initAttr.height) - Math.round(moveArea.y)) <= RANGE &&
                e.clientY < start.y
              ? height
              : parseInt(initAttr.height) - Math.round(moveArea.y);
          let offTop =
            parseInt(initAttr.top) + Math.round(moveArea.y) < 0
              ? 0
              : parseInt(initAttr.top) + Math.round(moveArea.y);
          currentHotBox.style.height = nowH + "px";
          currentHotBox.style.top = offTop + "px";
          // selectActive.height = nowH;
          // selectActive.top = offTop;
        }
        if (initAttr.direct == "ne") {
          let nowW =
            parseInt(initAttr.width) + Math.round(moveArea.x) > width
              ? width
              : width - (parseInt(initAttr.width) + Math.round(moveArea.x)) <= RANGE &&
                e.clientX > start.x
              ? width
              : parseInt(initAttr.width) + Math.round(moveArea.x);
          let nowH =
            parseInt(initAttr.height) - Math.round(moveArea.y) > height
              ? height
              : height - (parseInt(initAttr.height) - Math.round(moveArea.y)) <= RANGE &&
                e.clientY < start.y
              ? height
              : parseInt(initAttr.height) - Math.round(moveArea.y);
          let offTop =
            parseInt(initAttr.top) + Math.round(moveArea.y) < 0
              ? 0
              : parseInt(initAttr.top) + Math.round(moveArea.y);
          currentHotBox.style.height = nowH + "px";
          currentHotBox.style.top = offTop + "px";
          currentHotBox.style.width = nowW + "px";
          // selectActive.height = nowH;
          // selectActive.top = offTop;
          // selectActive.width = nowW;
        }
        if (initAttr.direct == "nw") {
          let nowH =
            parseInt(initAttr.height) - Math.round(moveArea.y) > height
              ? height
              : height - (parseInt(initAttr.height) - Math.round(moveArea.y)) <= RANGE &&
                e.clientY < start.y
              ? height
              : parseInt(initAttr.height) - Math.round(moveArea.y);
          let offTop =
            parseInt(initAttr.top) + Math.round(moveArea.y) < 0
              ? 0
              : parseInt(initAttr.top) + Math.round(moveArea.y);
          let nowW =
            parseInt(initAttr.width) - Math.round(moveArea.x) > width
              ? width
              : width - (parseInt(initAttr.width) - Math.round(moveArea.x)) <= RANGE &&
                e.clientX < start.x
              ? width
              : parseInt(initAttr.width) - Math.round(moveArea.x);
          let offLeft =
            parseInt(initAttr.left) + Math.round(moveArea.x) < 0
              ? 0
              : parseInt(initAttr.left) + Math.round(moveArea.x);
          currentHotBox.style.width = nowW + "px";
          currentHotBox.style.left = offLeft + "px";
          currentHotBox.style.height = nowH + "px";
          currentHotBox.style.top = offTop + "px";
          // Object.assign(selectActive, { width: nowW, left: offLeft, height: nowH, top: offTop });
        }
        if (initAttr.direct == "sw") {
          let nowH =
            parseInt(initAttr.height) + Math.round(moveArea.y) > height
              ? height
              : height - (parseInt(initAttr.height) + Math.round(moveArea.y)) <= RANGE &&
                e.clientY > start.Y
              ? height
              : parseInt(initAttr.height) + Math.round(moveArea.y);
          let nowW =
            parseInt(initAttr.width) - Math.round(moveArea.x) > width
              ? width
              : width - (parseInt(initAttr.width) - Math.round(moveArea.x)) <= RANGE &&
                e.clientX < start.x
              ? width
              : parseInt(initAttr.width) - Math.round(moveArea.x);
          let offLeft =
            parseInt(initAttr.left) + Math.round(moveArea.x) < 0
              ? 0
              : parseInt(initAttr.left) + Math.round(moveArea.x);
          currentHotBox.style.height = nowH + "px";
          currentHotBox.style.width = nowW + "px";
          currentHotBox.style.left = offLeft + "px";
          // Object.assign(selectActive, { width: nowW, left: offLeft, height: nowH });
        }
        if (initAttr.direct == "se") {
          let nowH =
            parseInt(initAttr.height) + Math.round(moveArea.y) > height
              ? height
              : height - (parseInt(initAttr.height) + Math.round(moveArea.y)) <= RANGE &&
                e.clientY > start.Y
              ? height
              : parseInt(initAttr.height) + Math.round(moveArea.y);
          let nowW =
            parseInt(initAttr.width) + Math.round(moveArea.x) > width
              ? width
              : width - (parseInt(initAttr.width) + Math.round(moveArea.x)) <= RANGE &&
                e.clientX > start.x
              ? width
              : parseInt(initAttr.width) + Math.round(moveArea.x);
          currentHotBox.style.width = nowW + "px";
          currentHotBox.style.height = nowH + "px";
          // Object.assign(selectActive, { width: nowW, height: nowH });
        }

        // selectActive.width = selectActive.width < 0 ? 0 : selectActive.width;
        // selectActive.height = selectActive.height < 0 ? 0 : selectActive.height;
      }
    };
  }

  private moveHotArea(target: HTMLElement, start: any, usearea: any, scale: number) {
    let drag = this.getBoxContent(target) as HTMLElement;
    if (!drag.parentElement) return;
    // 相对页面当前位置
    let initPosition = getOffset(drag.parentElement);
    // 相对container当前位置
    let startPosition = {
      x: drag.parentElement.style.left || getCss(drag.parentElement, "left"),
      y: drag.parentElement.style.top || getCss(drag.parentElement, "top"),
    };
    // let id = drag.parentElement.getAttribute("data-id");
    // let selectActive = this.cliplist.find((item) => {
    //     if (item.id == id) {
    //         return item;
    //     }
    // });

    startPosition.x = parseInt(startPosition.x) * scale;
    startPosition.y = parseInt(startPosition.y) * scale;
    document.onmousemove = e => {
      if (!drag.parentElement) return;
      // if (selectActive.locked) return;
      drag.parentElement.style.background = "#2aa7ff55";
      if (this.flag) {
        // 拖动热区标签
        this.dragAreaFlag = true;
        this.currentHotBox = drag.parentElement;
        // 移除其他框的active
        this.removeOtherActive();
        this.currentHotBox.classList.add("active");
        const moveX = e.clientX - start.x;
        const moveY = e.clientY - start.y;
        console.log(moveX, moveY);
        let result = {
          x:
            parseInt(startPosition.x) + moveX > usearea.width - initPosition.width
              ? usearea.width - initPosition.width
              : parseInt(startPosition.x) + moveX < 0
              ? 0
              : parseInt(startPosition.x) + moveX,
          y:
            parseInt(startPosition.y) + moveY > usearea.height - initPosition.height
              ? usearea.height - initPosition.height
              : parseInt(startPosition.y) + moveY < 0
              ? 0
              : parseInt(startPosition.y) + moveY,
        };
        // selectActive.drag = true;
        // selectActive.left = parseInt(result.x / scale) < 0 ? 0 : parseInt(result.x / scale);
        // selectActive.top = parseInt(result.y / scale) < 0 ? 0 : parseInt(result.y / scale);
        this.currentHotBox.style.left = Math.round(result.x / scale) + "px";
        this.currentHotBox.style.top = Math.round(result.y / scale) + "px";
      }
    };
  }

  private getBoxContent(target: Element) {
    let boxContent = null,
      parent = target.parentNode as HTMLElement;
    // 获取标记的拖动元素
    if (target.classList.contains("crop-box-content")) {
      boxContent = target;
    }
    while (parent && boxContent == null) {
      if (parent.classList && parent.classList.contains("crop-box-content")) {
        boxContent = parent;
      } else {
        parent = parent.parentNode as HTMLElement;
      }
    }
    return boxContent;
  }

  private addHotArea(target: HTMLElement, start: any, usearea: any, scale: number) {
    // 鼠标在容器内的相对位置
    const relativePosition = {
      x: start.x - parseInt(usearea.left),
      y: start.y - parseInt(usearea.top),
    };
    relativePosition.x = parseInt(String(relativePosition.x)) / scale;
    relativePosition.y = parseInt(String(relativePosition.y)) / scale;
    // 创建一个新热区
    this.newHotBox = this.hotbox.cloneNode(true) as HTMLElement;
    const newHotBox = this.newHotBox as HTMLElement;
    const flag = this.flag;
    newHotBox.dataset["index"] = String(this.boxIdx);
    newHotBox.style.width = "0px";
    newHotBox.style.height = "0px";
    newHotBox.style.left = relativePosition.x + "px";
    newHotBox.style.top = relativePosition.y + "px";
    // 在确定用户拖动前隐藏，避免点击出现热区
    newHotBox.style.display = "none";
    if (!target.parentNode) return;
    target.parentNode.appendChild(newHotBox);

    document.onmousemove = e => {
      if (flag) {
        // 新增热区标签
        this.addHotFlag = true;
        // 显示热区
        newHotBox.style.display = "block";
        // 移除其他框的active
        this.removeOtherActive();
        newHotBox.classList.add("active");
        // 实际移动距离
        const move = {
          x: e.clientX - start.x,
          y: e.clientY - start.y,
        };
        const moveX = move.x,
          moveY = move.y;
        const limit = {
          x:
            Math.round(relativePosition.x * scale) + moveX > usearea.width
              ? usearea.width
              : Math.round(relativePosition.x * scale) + moveX < 0
              ? 0
              : Math.round(relativePosition.x * scale) + moveX,
          y:
            Math.round(relativePosition.y * scale) + moveY > usearea.height
              ? usearea.height
              : Math.round(relativePosition.y * scale) + moveY < 0
              ? 0
              : Math.round(relativePosition.y * scale) + moveY,
        };
        const width = Math.round(Math.abs(limit.x / scale - relativePosition.x));
        const height = Math.round(Math.abs(limit.y / scale - relativePosition.y));
        let left = Math.round(relativePosition.x);
        let top = Math.round(relativePosition.y);
        // 向左下移动
        if (move.x < 0 && move.y < 0) {
          left =
            relativePosition.x < Math.abs(moveX) / scale
              ? 0
              : relativePosition.x - Math.abs(moveX) / scale;
          top =
            relativePosition.y < Math.abs(moveY) / scale
              ? 0
              : relativePosition.y - Math.abs(moveY) / scale;
        } else if (move.x < 0 && move.y > 0) {
          left =
            relativePosition.x < Math.abs(moveX) / scale
              ? 0
              : relativePosition.x - Math.abs(moveX) / scale;
        } else if (move.x >= 0 && move.y < 0) {
          top =
            relativePosition.y < Math.abs(moveY) / scale
              ? 0
              : relativePosition.y - Math.abs(moveY) / scale;
        }
        // 随鼠标放大
        newHotBox.style.width = width + "px";
        newHotBox.style.height = height + "px";
        newHotBox.style.left = Math.round(left) + "px";
        newHotBox.style.top = Math.round(top) + "px";
        Object.assign(this.nowclipData, {
          width,
          height,
          locked: false,
          left: Math.round(left),
          top: Math.round(top),
        });
      }
    };
  }

  private mouseUp() {
    if (this.addHotFlag) {
      const newHotBox = this.newHotBox as HTMLElement;
      // 20可以通过陪参传入
      if (parseInt(newHotBox.style.width) < 20 || parseInt(newHotBox.style.height) < 20) {
        //console.log(newHotBox);
        newHotBox && newHotBox.parentNode?.removeChild(newHotBox);
        parseInt(newHotBox.style.width) < 20 && console.log("热区宽度太窄了，建议大于20px");
        parseInt(newHotBox.style.height) < 20 && console.log("热区高度太小了，建议大于20px");
      } else {
        this.boxIdx++;
        this.nowclipData.drag = true;
        this.cliplist.push(this.nowclipData);
        this.initDragPoint();
        // this.options.container.removeChild(newHotBox);
        // this.handler.initClipData(this.cliplist);
      }
    }
    console.log(this.cliplist);
    this.flag = false;
    this.addHotFlag = false;
    this.dragAreaFlag = false;
    this.dragPointFlag = false;
    this.currentHotBox = null;
    this.newHotBox = null;
    // 释放拖动事件
    document.onmousemove = null;
    document.onselectstart = null;
    this.options.container.ondragstart = null;
  }

  private initDragPoint() {
    const active = this.options.container.querySelector(".hot-crop-box.active");
    if (!active) return;
    const scaleInfo = ["e", "n", "w", "s", "ne", "nw", "sw", "se"];
    const cropBox = createDiv({
      className: "crop-box-content",
      cssText: `width: 100%;
      height: 100%;
      box-sizing: border-box;
      opacity: 0.3;
      cursor: move;`,
    });
    active.appendChild(cropBox);
    scaleInfo.forEach(item => {
      active.appendChild(
        createDiv({
          className: `cropper-point point-${item}`,
          attr: { "data-direct": item },
          cssText: `--scale: ${1 / this.options.scale < 1 ? 1 : 1 / this.options.scale} `,
        })
      );
    });
  }

  private removeOtherActive = () => {
    this.cliplist.forEach((item: any) => {
      item.drag = false;
    });
    const active = this.options.container.querySelector(".hot-crop-box.active");

    active && removeClass(active, "active");
  };
}
export default Slice;
