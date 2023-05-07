import {
  defineQuery,
  enterQuery,
  IWorld,
  removeComponent
} from "bitecs";
import { Clock } from "three";
import {
  TimeInit,
  Time,
  TimeProxy
} from "../components/time";

const initEnterQuery = enterQuery(defineQuery([TimeInit]));
const timeQuery = defineQuery([Time]);

export const timeSystem = (world: IWorld): void => {
  initEnterQuery(world).forEach(eid => {
    removeComponent(world, TimeInit, eid);
    TimeProxy.get(eid).allocate(world, new Clock(), 0, 0);
  });

  timeQuery(world).forEach(eid => {
    const proxy = TimeProxy.get(eid);
    const clock = proxy.clock;
    const delta = clock.getDelta(); 
    proxy.delta = delta;
    proxy.elapsed += delta;
  });
};
