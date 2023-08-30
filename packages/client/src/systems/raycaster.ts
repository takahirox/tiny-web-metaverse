import { defineQuery, exitQuery, IWorld } from "bitecs";
import { RaycasterComponent, RaycasterProxy } from "../components/raycast";

const raycasterExitQuery = exitQuery(defineQuery([RaycasterComponent]));

export const raycasterSystem = (world: IWorld): void => {
  raycasterExitQuery(world).forEach(eid => {
    RaycasterProxy.get(eid).free(); 
  });
};
