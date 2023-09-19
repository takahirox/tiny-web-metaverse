import {
  addComponent,
  defineQuery,
  exitQuery,
  IWorld,
  removeComponent
} from "bitecs";
import { AnimationClip, Object3D } from "three";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";
import {
  ActiveAnimationsUpdated,
  LazyActiveAnimations,
  LazyActiveAnimationsProxy,
  MixerAnimation,
  MixerAnimationProxy
} from "../components/mixer_animation";
import { Time, TimeProxy } from "../components/time";
import { addAnimation } from "../utils/mixer_animation";

// TODO: Optimize
// TODO: Duplicated with the one in mixer_animation serialize file
const collectClips = (root: Object3D): AnimationClip[] => {
  const clips: AnimationClip[] = [];
  root.traverse(obj => {
    for (const animation of obj.animations) {
      clips.push(animation);
    }
  });
  return clips;	
};

const lazyQuery = defineQuery([EntityObject3D, LazyActiveAnimations, MixerAnimation]);
const lazyExitQuery = exitQuery(defineQuery([LazyActiveAnimations]));
const timeQuery = defineQuery([Time]);

export const lazilyActivateAnimationSystem = (world: IWorld): void => {
  // Assume single time entity always exists
  const timeProxy = TimeProxy.get(timeQuery(world)[0]);

  lazyQuery(world).forEach(eid => {
    const root = EntityObject3DProxy.get(eid).root;
    const clips = collectClips(root);

    if (clips.length === 0) {
      return;
    }

    const mixer = MixerAnimationProxy.get(eid).mixer;
    const animations = LazyActiveAnimationsProxy.get(eid).animations;

    // Use pause
    for (const animation of animations) {
      const clip = clips[animation.index];
      const action = mixer.clipAction(clip, root);
      action.play();
      action.time = (timeProxy.elapsed - animation.startedAt) % clip.duration;
      addAnimation(world, eid, action);
    }

    addComponent(world, ActiveAnimationsUpdated, eid);
    removeComponent(world, LazyActiveAnimations, eid);
  });

  lazyExitQuery(world).forEach(eid => {
    LazyActiveAnimationsProxy.get(eid).free();
  });
};
