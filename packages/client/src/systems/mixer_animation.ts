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
  MixerAnimation,
  MixerAnimationProxy
} from "../components/mixer_animation";
import {
  Time,
  TimeProxy
} from "../components/time";

const animationQuery = defineQuery([MixerAnimation]);
const exitAnimationQuery = exitQuery(animationQuery);
const timeQuery = defineQuery([Time]);
const animationsExitQuery = exitQuery(defineQuery([ActiveAnimations]));
const updatedQuery = defineQuery([ActiveAnimationsUpdated]);

export const mixerAnimationSystem = (world: IWorld): void => {
  animationsExitQuery(world).forEach(eid => {
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
    // TODO: Uncache resources
    proxy.free();
  });

  animationQuery(world).forEach(eid => {
    // Assumes alwayt single time entity exists
    const delta = TimeProxy.get(timeQuery(world)[0]).delta;
    const mixer = MixerAnimationProxy.get(eid).mixer;
    mixer.update(delta);
  });
};

export const clearActiveAnimationsUpdatedSystem = (world: IWorld) => {
  updatedQuery(world).forEach(eid => {
    removeComponent(world, ActiveAnimationsUpdated, eid);
  });	  
};
