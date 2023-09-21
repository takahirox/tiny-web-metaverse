import { defineQuery, exitQuery, IWorld } from "bitecs";
import { Video, VideoProxy } from "../components/video";

const videoExitQuery = exitQuery(defineQuery([Video]));

export const videoSystem = (world: IWorld): void => {
  videoExitQuery(world).forEach(eid => {
    const proxy = VideoProxy.get(eid);

    const video = proxy.video;
    video.pause();

    proxy.free();
  });	  
};
