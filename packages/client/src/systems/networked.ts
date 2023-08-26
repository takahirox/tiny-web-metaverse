import { defineQuery, exitQuery, IWorld } from "bitecs";
import { Networked, NetworkedProxy } from "../components/network";

const networkedExitQuery = exitQuery(defineQuery([Networked]));

export const networkedSystem = (world: IWorld): void => {
  networkedExitQuery(world).forEach(eid => {
    NetworkedProxy.get(eid).free();
  });
};
