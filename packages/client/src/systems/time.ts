import { defineQuery, IWorld } from "bitecs";
import {
  Time,
  TimeProxy
} from "../components/time";

const timeQuery = defineQuery([Time]);

export const timeSystem = (world: IWorld): void => {
  timeQuery(world).forEach(eid => {
    const proxy = TimeProxy.get(eid);
    const clock = proxy.clock;
    const delta = clock.getDelta(); 
    proxy.delta = delta;
    proxy.elapsed += delta;
  });
};
