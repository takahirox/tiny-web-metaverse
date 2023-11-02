import {
  addComponent,
  addEntity,
  IWorld
} from "bitecs";
import {
  EntityObject3D,
  EntityObject3DProxy,
  FirstSourceInteractable,
  GltfAssetLoader,
  GltfAssetLoaderProxy,
  Grabbable,
  InScene,
  MouseButtonEventListener,
  NetworkedPosition,
  NetworkedQuaternion,
  NetworkedScale,
  Raycastable,
  SecondSourceInteractable,
  Selectable,
  TouchEventListener,
  XRControllerSelectEventListener
} from "@tiny-web-metaverse/client/src";

export const GltfPrefab = (world: IWorld, params: { url: string }): number => {
  const eid = addEntity(world);
  addComponent(world, NetworkedPosition, eid);
  addComponent(world, NetworkedQuaternion, eid);
  addComponent(world, NetworkedScale, eid);
  addComponent(world, InScene, eid);
  addComponent(world, Raycastable, eid);
  addComponent(world, MouseButtonEventListener, eid);
  addComponent(world, TouchEventListener, eid);
  addComponent(world, XRControllerSelectEventListener, eid);
  addComponent(world, FirstSourceInteractable, eid);
  addComponent(world, Grabbable, eid);
  addComponent(world, SecondSourceInteractable, eid);
  addComponent(world, Selectable, eid);
  addComponent(world, InScene, eid);

  addComponent(world, EntityObject3D, eid);
  EntityObject3DProxy.get(eid).allocate();

  addComponent(world, GltfAssetLoader, eid);
  GltfAssetLoaderProxy.get(eid).allocate(params.url);

  return eid;
};
