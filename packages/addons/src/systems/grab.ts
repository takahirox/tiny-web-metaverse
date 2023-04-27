import {
  addComponent,
  defineQuery,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import {
  Raycasted,
  RaycastedNearest,
  FirstSourceInteracted,
  FirstSourceInteractionLeaveEvent
} from "@tiny-web-metaverse/client/src";
import {
  Grabbable,
  Grabbed,
  GrabbedByFirstSource,
  GrabbedBySecondSource
} from "../components/grab";

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
