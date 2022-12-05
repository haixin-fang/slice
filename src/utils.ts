const STRING = "string";

export function isString(value: any): value is string {
  return typeof value === STRING;
}
export function addEvent(
  el: EventTarget,
  type: string,
  listener: (e: Event) => void,
  options?: boolean | AddEventListenerOptions
) {
  el.addEventListener(type, listener, options);
}
export const createDiv = ({ className, cssText }: { className: string; cssText: string }) => {
  const el = globalThis.document.createElement("div");
  el.className = className;
  el.style.cssText = cssText;
  return el;
};

export const getScroll = function (scrollProp: any, offsetProp: any) {
  if (typeof window[offsetProp] !== "undefined") {
    return window[offsetProp];
  }
  if (document.documentElement.clientHeight) {
    return document.documentElement[scrollProp];
  }
  return document.body[scrollProp];
};
export const getOffset = function (el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + getScroll("scrollLeft", "pageXOffset"),
    top: rect.top + getScroll("scrollTop", "pageYOffset"),
    width: rect.right - rect.left,
    height: rect.bottom - rect.top,
  };
};
export function removeClass(element: Element, className: string) {
  if (element.classList) {
    element.classList.remove(className);
  } else {
    const reg = new RegExp(`(\\s|^)${className}(\\s|$)`);

    element.className = element.className.replace(reg, " ");
  }
}

export const getCss = function (o:HTMLElement, key:string) {
    return window.getComputedStyle(o, null)[key];
};