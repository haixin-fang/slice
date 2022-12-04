import { EventEmitter } from "events";
import { isString, addEvent, createDiv } from "./utils";
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
      width: 225px; height: 64px; display: none;
    `,
  });
};
class Slice<SliceTypes> extends EventEmitter {
  public options: any = {};
  private hotbox: Element | null = createHotBox();
  private boxIdx = 1;
  private start: any = null;
  private addHotFlag = false;
  private dragPointFlag = false;
  private dragAreaFlag = false;
  private currentHotBox: Element | null = null;
  private neeHotBox: Element | null = null;

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
      container: element,
      ...options,
    };

    this.initHotBox();

    addEvent(element, "mousedown", this.dragStart);
  }

  public dragStart(e: any) {}

  private initHotBox() {}
}
export default Slice;
