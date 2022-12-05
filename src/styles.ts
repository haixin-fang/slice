export const setglobalStyle = (id: string) => {
  return `
      #${id} .hot-area-img {
        width: 100%;
        height: 100%;
      }
      #${id} .hot-crop-box {
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
        -webkit-user-select: none;
           -moz-user-select: none;
                user-select: none;
      }
      #${id} .hot-crop-box.locked {
        pointer-events: none;
      }
      #${id} .hot-crop-box.locked .cur-box {
        background: #575656;
      }
      #${id} .hot-crop-box .cur-box {
        position: absolute;
        top: 2px;
        left: 2px;
        min-height: 12px;
        min-width: 15px;
        line-height: 12px;
        font-size: 12px;
        text-align: center;
        background: blue;
        color: white;
        transform-origin: left top;
      }
      #${id} .hot-crop-box .poi {
        position: absolute;
        left: calc(100% + 7px);
        top: 0;
        min-width: 90px;
        min-height: 70px;
        font-size: 8px;
        display: flex;
        transform-origin: left top;
        flex-direction: column;
        justify-content: center;
        padding: 3px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border-radius: 5%;
        pointer-events: none;
      }
      #${id} .hot-crop-box .poi > span {
        flex: 1;
        line-height: 1;
        display: flex;
        align-items: center;
      }
      #${id} .hot-crop-box.active .crop-box-content {
        background-color: #2aa7ff55;
      }
      #${id} .hot-crop-box.active:not(.locked) .cropper-point {
        display: block;
      }
      #${id} .crop-box-content {
        width: 100%;
        height: 100%;
        border: 2px solid #2aa7ff;
        box-sizing: border-box;
        opacity: 0.3;
        cursor: move;
      }
      #${id} .cropper-point {
        display: none;
        position: absolute;
        height: 12px;
        width: 12px;
        border-radius: 50%;
        box-sizing: border-box;
        transform: scale(var(--scale));
      }
      #${id} .cropper-point::after {
        display: block;
        content: "";
        width: 6px;
        height: 6px;
        background-color: #39f;
        opacity: 0.75;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      #${id} .cropper-point.point-e {
        cursor: ew-resize;
        margin-top: -5px;
        right: -5px;
        top: 50%;
      }
      #${id} .cropper-point.point-n {
        cursor: ns-resize;
        margin-left: -5px;
        left: 50%;
        top: -5px;
      }
      #${id} .cropper-point.point-w {
        cursor: ew-resize;
        left: -5px;
        margin-top: -5px;
        top: 50%;
      }
      #${id} .cropper-point.point-s {
        bottom: -5px;
        cursor: s-resize;
        left: 50%;
        margin-left: -5px;
      }
      #${id} .cropper-point.point-ne {
        cursor: nesw-resize;
        right: -5px;
        top: -5px;
      }
      #${id} .cropper-point.point-nw {
        cursor: nwse-resize;
        left: -5px;
        top: -5px;
      }
      #${id} .cropper-point.point-sw {
        bottom: -5px;
        cursor: nesw-resize;
        left: -5px;
      }
      #${id} .cropper-point.point-se {
        bottom: -5px;
        right: -5px;
        cursor: nwse-resize;
      }`;
};
