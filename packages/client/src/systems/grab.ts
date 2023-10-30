import {
  addComponent,
  defineQuery,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import {
  Grabbable,
  Grabbed,
  GrabbedByFirstSource,
  GrabbedBySecondSource
} from "../components/grab";
import { Raycasted, RaycastedNearest } from "../components/raycast";
import {
  FirstSourceInteracted,
  FirstSourceInteractionLeaveEvent
} from "../components/interact";

// TODO: Should what source to trigger be configurable?
const grabingQuery = defineQuery([FirstSourceInteracted, Grabbable, Raycasted, RaycastedNearest]);
const releasingQuery = defineQuery([FirstSourceInteractionLeaveEvent, Grabbable, Grabbed]);

// TODO: In immersive mode, should be grabbable with both first and second source?

export const grabSystem = (world: IWorld) => {
  grabingQuery(world).forEach(eid => {
    addComponent(world, Grabbed, eid);
    Grabbed.distance[eid] = Raycasted.distance[eid];
    addComponent(world, GrabbedByFirstSource, eid);
  });

  releasingQuery(world).forEach(eid => {
    removeComponent(world, GrabbedByFirstSource, eid);
    if (!hasComponent(world, GrabbedBySecondSource, eid)) {
      removeComponent(world, Grabbed, eid);
    }
  });
};
