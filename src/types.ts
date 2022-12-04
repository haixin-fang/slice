export interface SliceTypes {
  /**
   * 自定义配置
   */
  options: any;
  /**
   * 创建dom的热区
   */
  hotbox: Element | null;
  /**
   * 热区的标记
   */
  boxIdx: number;
  /**
   * 鼠标落下的点位
   */
  start: any;
  /**
   * 判断是新增热区还是拖动已有热区
   */
  addHotFlag: boolean;
  /**
   * 判断是否拖动缩放点
   */
  dragPointFlag: boolean;
  /**
   * 判断是否拖动热区
   */
  dragAreaFlag: boolean;
  /**
   * 当前拖动的热区
   */
  currentHotBox: Element | null;
  /**
   * 创建的新热区
   */
  neeHotBox: Element | null;
}
