import { defineQuery, exitQuery, IWorld } from "bitecs";
import { RaycasterTag, RaycasterProxy } from "../components/raycast";

const raycasterExitQuery = exitQuery(defineQuery([RaycasterTag]));

export const raycasterSystem = (world: IWorld): void => {
  raycasterExitQuery(world).forEach(eid => {
    RaycasterProxy.get(eid).free(); 
  });
};
