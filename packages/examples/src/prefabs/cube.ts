import {
  addComponent,
  addEntity,
  IWorld
} from "bitecs";
import { BoxGeometry, Mesh, MeshStandardMaterial } from "three";
import {
  addObject3D,
  Grabbable,
  InScene,
  MouseButtonEventListener,
  NetworkedPosition,
  NetworkedQuaternion,
  NetworkedScale,
  Raycastable,
  SecondSourceInteractable,
  Selectable
} from "@tiny-web-metaverse/client/src";

export const CubePrefab = (world: IWorld): number => {
  const eid = addEntity(world);
  addComponent(world, NetworkedPosition, eid);
  addComponent(world, NetworkedQuaternion, eid);
  addComponent(world, NetworkedScale, eid);
  addComponent(world, Raycastable, eid);
  addComponent(world, MouseButtonEventListener, eid);
  addComponent(world, Grabbable, eid);
  addComponent(world, SecondSourceInteractable, eid);
  addComponent(world, Selectable, eid);
  addComponent(world, InScene, eid);
  addObject3D(world, new Mesh(
    new BoxGeometry(0.5, 0.5, 0.5),
    new MeshStandardMaterial({ metalness: 0.8, roughness: 0.2 })
  ), eid);
  return eid;
};
