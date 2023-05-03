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
  timeProxy
} from "../components/time";

const initializeQuery = defineQuery([TimeInitialize]);
const initializeEnterQuery = enterQuery(initializeQuery);

const timeQuery = defineQuery([Time]);
const timeExitQuery = exitQuery(timeQuery);

export const timeSystem = (world: IWorld): void => {
  initializeEnterQuery(world).forEach(eid => {
    timeProxy.eid = eid;
    timeProxy.add(world, new Clock(), 0, 0);
    removeComponent(world, TimeInitialize, eid);
  });

  timeExitQuery(world).forEach(eid => {
    timeProxy.eid = eid;
    timeProxy.remove(world);
  });

  timeQuery(world).forEach(eid => {
    timeProxy.eid = eid;
    const clock = timeProxy.clock;
    const delta = clock.getDelta(); 
    timeProxy.delta = delta;	
    timeProxy.elapsed += delta;
  });
};
