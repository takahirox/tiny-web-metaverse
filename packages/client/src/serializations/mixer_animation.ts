import {
  addComponent,
  defineQuery,
  hasComponent,
  IWorld
} from "bitecs";
import { AnimationClip, Object3D } from "three";
import { TIME_EPSILON } from "../common";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";
import {
  ActiveAnimations,
  ActiveAnimationsProxy,
  ActiveAnimationsUpdated,
  MixerAnimation,
  MixerAnimationProxy
} from "../components/mixer_animation";
import { Time, TimeProxy } from "../components/time";
import { hasComponents } from "../utils/bitecs";
import { addAnimation } from "../utils/mixer_animation";

const timeQuery = defineQuery([Time]);

// TODO: Not sure if implemented properly. May need revisit.

// TODO: Add loop?
export type SerializedMixerAnimation = { index: number, paused: boolean, time: number }[];

// TODO: Validation

// TODO: Optimize
// TODO: More robust. Is the order guaranteed across the clients(platforms)?
const collectClips = (root: Object3D): AnimationClip[] => {
  const clips: AnimationClip[] = [];
  root.traverse(obj => {
    for (const animation of obj.animations) {
      clips.push(animation);
    }
  });
  return clips;	
};

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
      }
    }    
  }
  return data;
};

const deserialize = (world: IWorld, eid: number, data: SerializedMixerAnimation): void => {
  if (!hasComponents(world, [EntityObject3D, MixerAnimation], eid)) {
    throw new Error('deserialize MixerAnimation requires EntityObject3D and MixerAnimation component.');
  }

  const mixer = MixerAnimationProxy.get(eid).mixer;
  const root = EntityObject3DProxy.get(eid).root;

  // TODO: Implement properly
  // TODO: Consider paused

  if (hasComponent(world, ActiveAnimations, eid)) {
    for (const action of ActiveAnimationsProxy.get(eid).actions) {
      action.stop();
      mixer.uncacheAction(action.getClip(), action.getRoot());
    }    
    ActiveAnimationsProxy.get(eid).actions.length = 0;
  }

  const clips = collectClips(root);
  for (const entry of data) {
    if (entry.index >= clips.length) {
      // TODO: What if entity objects are not set up yet?
      // TODO: Throw an error?
      continue;
    }
    const clip = clips[entry.index];
    const action = mixer.clipAction(clip, root);
    action.play();
    // TODO: Take the past time since this data is stored in the server
    action.time = entry.time;
    addAnimation(world, eid, action);
  }

  addComponent(world, ActiveAnimationsUpdated, eid);
};

const deserializeNetworked = (world: IWorld, eid: number, data: SerializedMixerAnimation): void => {
  // TODO: Implement Properly
  deserialize(world, eid, data);
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

  // Assumes always single time entity exists
  const timeProxy = TimeProxy.get(timeQuery(world)[0]);

  // TODO: Implement Properly
  // TODO: Optimize
  const root = EntityObject3DProxy.get(eid).root;
  const clips = collectClips(root);
  const data = serialize(world, eid);

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
      // TODO: Throw an error?
      // TODO: What to do?
      continue;
    }

    const clip = clips[entry1.index];
    // TODO: Check if these calculations are correct
    const elapsed = timeProxy.elapsed - updatedAt;

    if (Math.abs(((entry2.time + elapsed) % clip.duration) - entry1.time) > TIME_EPSILON) {
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
