import {
  addComponent,
  hasComponent,
  IWorld
} from "bitecs";
import { TIME_EPSILON } from "../common";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";
import {
  ActiveAnimations,
  ActiveAnimationsProxy,
  ActiveAnimationsUpdated,
  HasAnimations,
  LazyActiveAnimations,
  LazyActiveAnimationsProxy,
  MixerAnimation,
  MixerAnimationProxy
} from "../components/mixer_animation";
import { hasComponents } from "../utils/bitecs";
import { addAnimation } from "../utils/mixer_animation";
import { collectClips } from "../utils/three";
import { getTimeProxy } from "../utils/time";

// TODO: Not sure if implemented properly. May need revisit.

// TODO: Add loop?
export type SerializedMixerAnimation = { index: number, paused: boolean, time: number }[];

// TODO: Validation

// TODO: Optimization
// TODO: Write comment about AnimationClips

const serialize = (world: IWorld, eid: number): SerializedMixerAnimation => {
  if (!hasComponents(world, [EntityObject3D, MixerAnimation], eid)) {
    throw new Error('serialize MixerAnimation requires EntityObject3D and MixerAnimation component.');
  }

  const data = [];
  if (hasComponent(world, ActiveAnimations, eid)) {
    const root = EntityObject3DProxy.get(eid).root;
    const clips = collectClips(root);

    for (const action of ActiveAnimationsProxy.get(eid).actions) {
      const index = clips.indexOf(action.getClip());
      if (index >= 0) {
        data.push({ index, paused: action.paused, time: action.time });
      } else {
        // TODO: Error handling
      }
    }
  }
  return data;
};

const deserialize = (
  world: IWorld,
  eid: number,
  data: SerializedMixerAnimation,
  updatedAt: number
): void => {
  if (!hasComponents(world, [EntityObject3D, MixerAnimation], eid)) {
    throw new Error('deserialize MixerAnimation requires EntityObject3D and MixerAnimation component.');
  }

  const mixer = MixerAnimationProxy.get(eid).mixer;
  const root = EntityObject3DProxy.get(eid).root;
  const timeProxy = getTimeProxy(world);

  // TODO: Implement properly
  // TODO: Consider paused

  // TODO: Write comment
  if (!hasComponent(world, HasAnimations, eid)) {
    addComponent(world, LazyActiveAnimations, eid);
    const proxy = LazyActiveAnimationsProxy.get(eid);
    proxy.allocate();

    for (const entry of data) {
      proxy.add(entry.index, timeProxy.elapsed - updatedAt - entry.time, entry.paused);
    }

    return;
  }

  const clips = collectClips(root);

  if (hasComponent(world, ActiveAnimations, eid)) {
    const proxy = ActiveAnimationsProxy.get(eid);
    for (const action of proxy.actions) {
      action.stop();
      mixer.uncacheAction(action.getClip(), action.getRoot());
    }
    proxy.clear();
  }

  for (const entry of data) {
    if (entry.index >= clips.length) {
      // TODO: Error handling
      continue;
    }
    const clip = clips[entry.index];
    const action = mixer.clipAction(clip, root);
    action.play();
    action.time = (timeProxy.elapsed - updatedAt + entry.time) % clip.duration;
    addAnimation(world, eid, action);
  }

  addComponent(world, ActiveAnimationsUpdated, eid);
};

const deserializeNetworked = (
  world: IWorld,
  eid: number,
  data: SerializedMixerAnimation,
  updatedAt: number
): void => {
  // TODO: Implement Properly
  deserialize(world, eid, data, updatedAt);
};

const checkDiff = (
  world: IWorld,
  eid: number,
  cache: SerializedMixerAnimation,
  updatedAt: number
): boolean => {
  if (!hasComponents(world, [EntityObject3D, MixerAnimation], eid)) {
    throw new Error('check diff MixerAnimation requires EntityObject3D and MixerAnimation component.');
  }

  // TODO: Write comment
  if (!hasComponent(world, HasAnimations, eid)) {
    return false;
  }

  // TODO: Implement Properly
  // TODO: Optimize
  const root = EntityObject3DProxy.get(eid).root;
  const clips = collectClips(root);
  const data = serialize(world, eid);
  const timeProxy = getTimeProxy(world);

  if (data.length !== cache.length) {
    return true;
  }

  for (let i = 0; i < data.length; i++) {
    const entry1 = data[i];
    const entry2 = cache[i];

    if (entry1.index !== entry2.index) {
      return true;
    }

    if (entry1.paused !== entry2.paused) {
      return true;
    }

    if (entry1.index >= clips.length) {
      // TODO: Error handling
      continue;
    }

    const clip = clips[entry1.index];
    // TODO: Check if these calculations are correct
    const elapsed = timeProxy.elapsed - updatedAt;
    // TODO: Take loop type into account
    const timeDiff = Math.min(
      Math.abs(((entry2.time + elapsed) % clip.duration) - entry1.time),
      clip.duration - Math.abs(((entry2.time + elapsed) % clip.duration) - entry1.time)
    );

    if (timeDiff > TIME_EPSILON) {
      return true;
    }
  }

  return false;
};

export const mixerAnimationSerializers = {
  deserializer: deserialize,
  diffChecker: checkDiff,
  networkDeserializer: deserializeNetworked,
  serializer: serialize,
};
