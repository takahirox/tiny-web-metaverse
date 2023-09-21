import {
  addComponent,
  addEntity,
  IWorld
} from "bitecs";
import {
  EntityObject3D,
  EntityObject3DProxy,
  InScene,
  Grabbable,
  MouseButtonEventListener,
  NetworkedPosition,
  NetworkedQuaternion,
  NetworkedScale,
  Raycastable,
  Selectable
} from "@tiny-web-metaverse/client/src";
import {
  NetworkedVideo,
  VideoLoader,
  VideoLoaderProxy,
} from "@tiny-web-metaverse/addons/src";

const videoUrl = 'assets/videos/video.mp4';

export const VideoPrefab = (world: IWorld): number => {
  const eid = addEntity(world);
  addComponent(world, NetworkedPosition, eid);
  addComponent(world, NetworkedQuaternion, eid);
  addComponent(world, NetworkedScale, eid);
  addComponent(world, NetworkedVideo, eid);
  addComponent(world, Raycastable, eid);
  addComponent(world, MouseButtonEventListener, eid);
  addComponent(world, Grabbable, eid);
  addComponent(world, Selectable, eid);
  addComponent(world, InScene, eid);

  addComponent(world, EntityObject3D, eid);
  EntityObject3DProxy.get(eid).allocate();

  addComponent(world, VideoLoader, eid);
  VideoLoaderProxy.get(eid).allocate(videoUrl);
  return eid;
};