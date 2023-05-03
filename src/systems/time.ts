import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld,
  removeComponent
} from "bitecs";
import { Clock } from "three";
import {
  TimeInitialize,
  Time,
  TimeProxy
} from "../components/time";

const initializeQuery = defineQuery([TimeInitialize]);
const initializeEnterQuery = enterQuery(initializeQuery);

const timeQuery = defineQuery([Time]);
const timeExitQuery = exitQuery(timeQuery);

export const timeSystem = (world: IWorld): void => {
  initializeEnterQuery(world).forEach(eid => {
    TimeProxy.get(eid).allocate(world, new Clock(), 0, 0);
    removeComponent(world, TimeInitialize, eid);
  });

  timeExitQuery(world).forEach(eid => {
    TimeProxy.get(eid).free(world);
  });

  timeQuery(world).forEach(eid => {
    const proxy = TimeProxy.get(eid);
    const clock = proxy.clock;
    const delta = clock.getDelta(); 
    proxy.delta = delta;
    proxy.elapsed += delta;
  });
};
