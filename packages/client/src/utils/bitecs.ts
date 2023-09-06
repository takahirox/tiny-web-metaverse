import {
  Component,
  hasComponent,
  getEntityComponents,
  IWorld,
  removeEntity
} from "bitecs";

export const removeEntityIfNoComponent = (world: IWorld, eid: number): boolean => {
  if (getEntityComponents(world, eid).length === 0) {
    removeEntity(world, eid);
    return true;
  }
  return false;
};

export const hasComponents = (world: IWorld, components: Component[], eid: number): boolean => {
  for (const component of components) {
    if (!hasComponent(world, component, eid)) {
      return false;
    }
  }
  return true;
};