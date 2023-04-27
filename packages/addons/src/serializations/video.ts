import {
  addComponent,
  hasComponent,
  IWorld
} from "bitecs";
import { getTimeProxy, TIME_EPSILON } from "@tiny-web-metaverse/client/src";
import {
  LazyVideoStateUpdate,
  LazyVideoStateUpdateProxy,
  Video,
  VideoProxy,
  VideoStateUpdated
} from "../components/video";

// TODO: Not sure if implemented properly. May need revisit.

// TODO: Add loop?
export type SerializedVideo = { muted: boolean, paused: boolean, time: number };

// TODO: Validation

// TODO: Optimization

const serialize = (world: IWorld, eid: number): SerializedVideo => {
  // TODO: Write comment
  if (!hasComponent(world, Video, eid)) {
    return { muted: true, paused: true, time: 0.0 };
  }

  const video = VideoProxy.get(eid).video;
  return { muted: video.muted, paused: video.paused, time: video.currentTime };
};

const deserialize = (
  world: IWorld,
  eid: number,
  data: SerializedVideo,
  updatedAt: number
): void => {
  const timeProxy = getTimeProxy(world);

  // TODO: Implement properly

  // TODO: Write comment
  if (!hasComponent(world, Video, eid)) {
    // TODO: What if already LazyVideoStateUpdate component is set?
    addComponent(world, LazyVideoStateUpdate, eid);
    LazyVideoStateUpdateProxy.get(eid).allocate(
      data.muted,
      data.paused,
      data.paused ? data.time : timeProxy.elapsed - updatedAt - data.time
    );
    return;
  }

  const video = VideoProxy.get(eid).video;
  // TODO: Update only when the diff is bigger than TIME_EPSILON?
  video.currentTime = (timeProxy.elapsed - updatedAt + data.time) % video.duration;

  if (data.paused && !video.paused) {
    video.pause();
  } else if (!data.paused && video.paused) {
    video.play();
  }

  if (data.muted !== video.muted) {
    video.muted = data.muted;
  }

  addComponent(world, VideoStateUpdated, eid);
};

const deserializeNetworked = (
  world: IWorld,
  eid: number,
  data: SerializedVideo,
  updatedAt: number
): void => {
  // TODO: Implement Properly
  deserialize(world, eid, data, updatedAt);
};

const checkDiff = (
  world: IWorld,
  eid: number,
  cache: SerializedVideo,
  updatedAt: number
): boolean => {
  // TODO: Write comment
  if (!hasComponent(world, Video, eid)) {
    return false;
  }

  // TODO: Implement Properly
  // TODO: Optimize
  const video = VideoProxy.get(eid).video;

  if (video.muted !== cache.muted) {
    return true;
  }

  if (video.paused !== cache.paused) {
    return true;
  }

  const timeProxy = getTimeProxy(world);
  // TODO: Check if these calculations are correct
  const elapsed = timeProxy.elapsed - updatedAt;
  const timeDiff = video.loop
    ? Math.min(
        Math.abs(((cache.time + elapsed) % video.duration) - video.currentTime),
        video.duration - Math.abs(((cache.time + elapsed) % video.duration) - video.currentTime)
      )
    : Math.abs(cache.time + elapsed - video.currentTime);

  if (timeDiff > TIME_EPSILON) {
    return true;
  }

  return false;
};

export const videoSerializers = {
  deserializer: deserialize,
  diffChecker: checkDiff,
  networkDeserializer: deserializeNetworked,
  serializer: serialize,
};
