import { EventEmitter } from "events";
import { isString, addEvent, createDiv, getOffset, removeClass } from "./utils";
const hotboxClass = "hot-crop-box";
import { SliceTypes } from "./types";
const createHotClass = (className: string) => {
  const style = document.createElement("style");
  style.innerHTML = `.${className}{
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    box-sizing: border-box;
    direction: ltr;
    font-size: 0;
    line-height: 0;
    touch-action: none;
    user-select: none;
  }`;
  document.head.appendChild(style);
};
const createHotBox = () => {
  createHotClass(hotboxClass);
  return createDiv({
    className: hotboxClass,
    cssText: `
      width: 225px; height: 64px; display: none;border:1px solid red;
    `,
  });
};
class Slice<SliceTypes> extends EventEmitter {
  public options: any = {};
  private hotbox: Element = createHotBox();
  private boxIdx = 1;
  private start: any = null;
  private addHotFlag = false;
  private dragPointFlag = false;
  private dragAreaFlag = false;
  private currentHotBox: Element | null = null;
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
      ...options,
    };
    this.initDragArea();
    addEvent(element, "mousedown", this.dragStart.bind(this));
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
    const scale = this.options.scale || 1;
    const start = {
      x: e.clientX,
      y: e.clientY,
    };
    this.options.flag = true;
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
    }
    // this.mouseUp();
    addEvent(document, "mouseup", this.mouseUp.bind(this));
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
    const flag = this.options.flag;
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
        // this.options.container.removeChild(newHotBox);
        // this.handler.initClipData(this.cliplist);
      }
    }
    console.log(this.cliplist);
    this.options.flag = false;
    this.addHotFlag = false;
    this.dragAreaFlag = false;
    this.dragPointFlag = false;
    this.currentHotBox = null;
    this.newHotBox = null;
    this.start = null;
    // 释放拖动事件
    document.onmousemove = null;
    document.onselectstart = null;
    this.options.container.ondragstart = null;
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
