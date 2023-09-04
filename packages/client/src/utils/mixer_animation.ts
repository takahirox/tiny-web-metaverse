import {
  addComponent,
  hasComponent,
  IWorld
} from "bitecs";
import { AnimationAction } from "three";
import { ActiveAnimations, ActiveAnimationsProxy } from "../components/mixer_animation";

export const addAnimation = (world: IWorld, eid: number, action: AnimationAction): void => {
  if (!hasComponent(world, ActiveAnimations, eid)) {
    addComponent(world, ActiveAnimations, eid);
    ActiveAnimationsProxy.get(eid).allocate();
  }
  ActiveAnimationsProxy.get(eid).add(action);
};
