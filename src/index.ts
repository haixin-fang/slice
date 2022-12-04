import { EventEmitter } from "events";
class Slice extends EventEmitter {
  public options: any = {};
  constructor(options: any) {
    super();
    this.options = options;
  }
}
export default Slice;
