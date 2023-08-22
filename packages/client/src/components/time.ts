import { defineComponent, Types } from "bitecs";
import { Clock } from "three";
import { NULL_EID } from "../common";

// f32 types might cause precision problem??
export const Time = defineComponent({
  delta: Types.f32,
  elapsed: Types.f32
});

export class TimeProxy {
  private static instance: TimeProxy = new TimeProxy();
  private eid: number;
  private map: Map<number, Clock>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): TimeProxy {
    TimeProxy.instance.eid = eid;
    return TimeProxy.instance;
  }

  allocate(
    clock: Clock,
    delta: number,
    elapsed: number
  ): void {
    Time.delta[this.eid] = delta;
    Time.elapsed[this.eid] = elapsed;
    this.map.set(this.eid, clock);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get clock(): Clock {
    return this.map.get(this.eid)!;
  }

  get delta(): number {
    return Time.delta[this.eid];
  }

  set delta(delta: number) {
    Time.delta[this.eid] = delta;
  }

  get elapsed(): number {
    return Time.elapsed[this.eid];
  }

  set elapsed(elapsed: number) {
    Time.elapsed[this.eid] = elapsed;
  }
}
