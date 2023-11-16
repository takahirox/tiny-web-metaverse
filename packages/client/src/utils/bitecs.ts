import {
  addComponent,
  Component,
  hasComponent,
  getEntityComponents,
  IWorld,
  removeComponent,
  removeEntity
} from "bitecs";
import { REMOVAL_INTERVAL } from "../common";
import { EntityRemoval } from "../components/removal";

export const removeEntityIfNoComponent = (world: IWorld, eid: number): boolean => {
  if (getEntityComponents(world, eid).length === 0) {
    removeEntity(world, eid);
    return true;
  }
  return false;
};

// TODO: Write comment for the reason why we need this function
export const removeComponentsAndThenEntity = (world: IWorld, eid: number): void => {
  for (const c of getEntityComponents(world, eid)) {
    removeComponent(world, c, eid);
  }
  addComponent(world, EntityRemoval, eid);
  EntityRemoval.interval[eid] = REMOVAL_INTERVAL;
};

export const hasComponents = (world: IWorld, components: Component[], eid: number): boolean => {
  for (const component of components) {
    if (!hasComponent(world, component, eid)) {
      return false;
    }
  }
  return true;
};
