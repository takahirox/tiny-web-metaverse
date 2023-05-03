import {
  addComponent,
  defineComponent,
  IWorld,
  removeComponent,
  Types
} from "bitecs";
import { Clock } from "three";
import { NULL_EID } from "../common";

export const TimeInitialize = defineComponent();
export const Time = defineComponent({
  delta: Types.f32,
  elapsed: Types.f32
});
const ClockMap = new Map<number, Clock>();

export class TimeProxy {
  private static instance: TimeProxy = new TimeProxy();
  private eid: number;

  constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): TimeProxy {
    TimeProxy.instance.eid = eid;
    return TimeProxy.instance;
  }

  allocate(
    world: IWorld,
    clock: Clock,
    delta: number,
    elapsed: number
  ): void {
    addComponent(world, Time, this.eid);
    Time.delta[this.eid] = delta;
    Time.elapsed[this.eid] = elapsed;
    ClockMap.set(this.eid, clock);
  }

  free(world: IWorld): void {
    removeComponent(world, Time, this.eid);
    ClockMap.delete(this.eid);
  }

  get clock(): Clock {
    return ClockMap.get(this.eid)!;
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
