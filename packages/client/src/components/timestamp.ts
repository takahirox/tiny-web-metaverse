import { defineComponent } from "bitecs";
import { NULL_EID } from "../common";

// f32 types might cause precision problem??
export const Timestamp = defineComponent();

export class TimestampProxy {
  private static instance: TimestampProxy = new TimestampProxy();
  private eid: number;
  private map: Map<number, number>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): TimestampProxy {
    TimestampProxy.instance.eid = eid;
    return TimestampProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, 0);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get timestamp(): number {
    return this.map.get(this.eid)!;
  }

  set timestamp(timestamp: number) {
    this.map.set(this.eid, timestamp);
  }
}
