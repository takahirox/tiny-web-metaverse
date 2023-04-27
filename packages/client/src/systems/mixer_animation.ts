import {
  defineQuery,
  exitQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  ActiveAnimations,
  ActiveAnimationsProxy,
  ActiveAnimationsUpdated,
  HasAnimations,
  MixerAnimation,
  MixerAnimationProxy
} from "../components/mixer_animation";
import { getTimeProxy } from "../utils/time";

const animationQuery = defineQuery([HasAnimations, MixerAnimation]);
const exitAnimationQuery = exitQuery(animationQuery);
const activeAnimationsExitQuery = exitQuery(defineQuery([ActiveAnimations]));
const updatedQuery = defineQuery([ActiveAnimationsUpdated]);

export const mixerAnimationSystem = (world: IWorld): void => {
  activeAnimationsExitQuery(world).forEach(eid => {
    const proxy = ActiveAnimationsProxy.get(eid);

    for (const action of proxy.actions) {
      const mixer = action.getMixer();
      const clip = action.getClip();
      const root = action.getRoot();
      action.stop();
      mixer.uncacheAction(clip, root);
    }

    proxy.free();
  });

  exitAnimationQuery(world).forEach(eid => {
    const proxy = MixerAnimationProxy.get(eid);
    const mixer = proxy.mixer;
    mixer.stopAllAction();
    // TODO: Uncache all resources
    proxy.free();
  });

  animationQuery(world).forEach(eid => {
    const delta = getTimeProxy(world).delta;
    const mixer = MixerAnimationProxy.get(eid).mixer;
    mixer.update(delta);
  });
};

export const clearActiveAnimationsUpdatedSystem = (world: IWorld) => {
  updatedQuery(world).forEach(eid => {
    removeComponent(world, ActiveAnimationsUpdated, eid);
  });	  
};
