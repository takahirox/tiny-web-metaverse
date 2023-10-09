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
  InScene,
  Grabbable,
  MouseButtonEventListener,
  NetworkedPosition,
  NetworkedQuaternion,
  NetworkedScale,
  Raycastable,
  SecondSourceInteractable,
  Selectable,
  TouchEventListener
} from "@tiny-web-metaverse/client/src";

const assetUrl = 'assets/models/Duck/Duck.gltf';

export const DuckPrefab = (world: IWorld): number => {
  const eid = addEntity(world);
  addComponent(world, NetworkedPosition, eid);
  addComponent(world, NetworkedQuaternion, eid);
  addComponent(world, NetworkedScale, eid);
  addComponent(world, Raycastable, eid);
  addComponent(world, MouseButtonEventListener, eid);
  addComponent(world, TouchEventListener, eid);
  addComponent(world, FirstSourceInteractable, eid);
  addComponent(world, Grabbable, eid);
  addComponent(world, SecondSourceInteractable, eid);
  addComponent(world, Selectable, eid);
  addComponent(world, InScene, eid);

  addComponent(world, EntityObject3D, eid);
  EntityObject3DProxy.get(eid).allocate();

  addComponent(world, GltfAssetLoader, eid);
  GltfAssetLoaderProxy.get(eid).allocate(assetUrl);
  return eid;
};
