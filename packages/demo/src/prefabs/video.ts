import {
  addComponent,
  addEntity,
  IWorld
} from "bitecs";
import {
  Grabbable,
  Selectable
} from "@tiny-web-metaverse/addons/src";
import {
  EntityObject3D,
  EntityObject3DProxy,
  FirstSourceInteractable,
  InScene,
  MouseButtonEventListener,
  NetworkedPosition,
  NetworkedQuaternion,
  NetworkedScale,
  Raycastable,
  SecondSourceInteractable,
  TouchEventListener,
  XRControllerSelectEventListener
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
  addComponent(world, TouchEventListener, eid);
  addComponent(world, XRControllerSelectEventListener, eid);
  addComponent(world, FirstSourceInteractable, eid);
  addComponent(world, SecondSourceInteractable, eid);
  addComponent(world, Grabbable, eid);
  addComponent(world, Selectable, eid);
  addComponent(world, InScene, eid);

  addComponent(world, EntityObject3D, eid);
  EntityObject3DProxy.get(eid).allocate();

  addComponent(world, VideoLoader, eid);
  VideoLoaderProxy.get(eid).allocate(videoUrl);
  return eid;
};
