import {
  defineQuery,
  getEntityComponents,
  IWorld,
  removeEntity
} from "bitecs";
import { REMOVAL_INTERVAL } from "../common";
import { EntityRemoval } from "../components/removal";

const removalQuery = defineQuery([EntityRemoval]);

export const entityRemovalSystem = (world: IWorld): void => {
  removalQuery(world).forEach(eid => {
    EntityRemoval.interval[eid]--;
    if (EntityRemoval.interval[eid] === 0) {
      // If only EntityRemoval component
      if (getEntityComponents(world, eid).length === 1) {
        removeEntity(world, eid);
      } else {
        EntityRemoval.interval[eid] = REMOVAL_INTERVAL;
      }
    }
  });
};