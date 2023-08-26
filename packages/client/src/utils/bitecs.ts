import {
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
