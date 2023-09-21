import {
  addComponent,
  defineQuery,
  exitQuery,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import {
  getTimeProxy
} from "@tiny-web-metaverse/client/src";
import {
  LazyVideoStateUpdate,
  LazyVideoStateUpdateProxy,
  Video,
  VideoProxy,
  VideoStateUpdated
} from "../components/video";

const lazyQuery = defineQuery([LazyVideoStateUpdate, Video]);
const lazyExitQuery = exitQuery(defineQuery([LazyVideoStateUpdate]));

export const lazilyUpdateVideoStateSystem = (world: IWorld): void => {
  const timeProxy = getTimeProxy(world);

  lazyQuery(world).forEach(eid => {
    // TODO: Write comment
    if (!hasComponent(world, Video, eid)) {
      return;
    }

    // TODO: Take loop into account
    const video = VideoProxy.get(eid).video;
    const proxy = LazyVideoStateUpdateProxy.get(eid);
    const muted = proxy.muted;
    const paused = proxy.paused;
    const time = proxy.time;

    if (paused && !video.paused) {
      video.pause();
    } else if (!paused && video.paused) {
      video.play();
    }

    if (muted !== video.muted) {
      video.muted = muted;
    }

    // TODO: Update only when the diff is bigger than TIME_EPSILON?
    video.currentTime = paused
      ? time
      : (timeProxy.elapsed + time) % video.duration;

    addComponent(world, VideoStateUpdated, eid);
    removeComponent(world, LazyVideoStateUpdate, eid);
  });

  lazyExitQuery(world).forEach(eid => {
    LazyVideoStateUpdateProxy.get(eid).free();
  });
};
