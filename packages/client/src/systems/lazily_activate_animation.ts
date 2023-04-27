import {
  addComponent,
  defineQuery,
  exitQuery,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";
import {
  ActiveAnimationsUpdated,
  LazyActiveAnimations,
  LazyActiveAnimationsProxy,
  HasAnimations,
  MixerAnimation,
  MixerAnimationProxy
} from "../components/mixer_animation";
import { addAnimation } from "../utils/mixer_animation";
import { collectClips } from "../utils/three";
import { getTimeProxy } from "../utils/time";

const lazyQuery = defineQuery([EntityObject3D, LazyActiveAnimations, MixerAnimation]);
const lazyExitQuery = exitQuery(defineQuery([LazyActiveAnimations]));

export const lazilyActivateAnimationSystem = (world: IWorld): void => {
  const timeProxy = getTimeProxy(world);

  lazyQuery(world).forEach(eid => {
    // TODO: Write comment
    if (!hasComponent(world, HasAnimations, eid)) {
      return;
    }

    // TODO: Remove the duplicated code with the one in the deserializers

    const root = EntityObject3DProxy.get(eid).root;
    const mixer = MixerAnimationProxy.get(eid).mixer;
    const animations = LazyActiveAnimationsProxy.get(eid).animations;
    const clips = collectClips(root);

    // TODO: Use pause
    for (const animation of animations) {
      if (animation.index >= clips.length) {
        // TODO: Error handling
        continue;
      }
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
