import { defineComponent } from "bitecs";
import { NULL_EID } from "../common";

// f32 types might cause precision problem??
export const Time = defineComponent();

export class TimeProxy {
  private static instance: TimeProxy = new TimeProxy();
  private eid: number;
  private map: Map<number, { delta: number, elapsed: number, timestamp: number } >;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): TimeProxy {
    TimeProxy.instance.eid = eid;
    return TimeProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, { delta: 0.0, elapsed: 0.0, timestamp: 0.0 });
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get delta(): number {
    return this.map.get(this.eid)!.delta;
  }

  set delta(delta: number) {
    this.map.get(this.eid)!.delta = delta;
  }

  get elapsed(): number {
    return this.map.get(this.eid)!.elapsed;
  }

  set elapsed(elapsed: number) {
    this.map.get(this.eid)!.elapsed = elapsed;
  }

  get timestamp(): number {
    return this.map.get(this.eid)!.timestamp;
  }

  set timestamp(timestamp: number) {
    this.map.get(this.eid)!.timestamp = timestamp;
  }
}
