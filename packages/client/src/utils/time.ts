import { defineQuery, IWorld } from "bitecs";
import { Time, TimeProxy } from "../components/time";

const timeQuery = defineQuery([Time]);

export const getTimeProxy = (world: IWorld): TimeProxy => {
  // Assumes always single time entity exists
  return TimeProxy.get(timeQuery(world)[0]);
};

