import {
  addComponent,
  defineQuery,
  IWorld,
  removeComponent
} from "bitecs";
import { Grabbable, Grabbed } from "../components/grab";
import { Raycasted, RaycastedNearest } from "../components/raycast";
import {
  FirstSourceInteracted,
  FirstSourceInteractionLeaveEvent
} from "../components/interact";

// TODO: Should what source to trigger be configurable?
const grabingQuery = defineQuery([FirstSourceInteracted, Grabbable, Raycasted, RaycastedNearest]);
const releasingQuery = defineQuery([FirstSourceInteractionLeaveEvent, Grabbable, Grabbed]);

// TODO: Rename to mouseGrabSystem?
export const grabSystem = (world: IWorld) => {
  grabingQuery(world).forEach(eid => {
    addComponent(world, Grabbed, eid);
    Grabbed.distance[eid] = Raycasted.distance[eid];
  });

  releasingQuery(world).forEach(eid => {
    removeComponent(world, Grabbed, eid);
  });
};
