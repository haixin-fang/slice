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
