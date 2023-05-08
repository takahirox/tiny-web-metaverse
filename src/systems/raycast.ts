import {
  defineQuery,
  IWorld,
  removeComponent
} from "bitecs";
import { Raycasted } from "../components/raycast";

const raycastedQuery = defineQuery([Raycasted]);

export const clearRaycastedSystem = (world: IWorld) => {
  raycastedQuery(world).forEach(eid => {
    removeComponent(world, Raycasted, eid);
  });
};