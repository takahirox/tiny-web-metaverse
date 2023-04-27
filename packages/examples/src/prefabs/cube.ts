import {
  addComponent,
  addEntity,
  IWorld
} from "bitecs";
import { BoxGeometry, Mesh, MeshStandardMaterial } from "three";
import {
  Grabbable,
  Selectable
} from "@tiny-web-metaverse/addons/src";
import {
  addObject3D,
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

export const CubePrefab = (world: IWorld): number => {
  const eid = addEntity(world);
  addComponent(world, NetworkedPosition, eid);
  addComponent(world, NetworkedQuaternion, eid);
  addComponent(world, NetworkedScale, eid);
  addComponent(world, Raycastable, eid);
  addComponent(world, MouseButtonEventListener, eid);
  addComponent(world, TouchEventListener, eid);
  addComponent(world, XRControllerSelectEventListener, eid);
  addComponent(world, FirstSourceInteractable, eid);
  addComponent(world, SecondSourceInteractable, eid);
  addComponent(world, Grabbable, eid);
  addComponent(world, Selectable, eid);
  addComponent(world, InScene, eid);
  addObject3D(world, new Mesh(
    new BoxGeometry(0.5, 0.5, 0.5),
    new MeshStandardMaterial({ metalness: 0.8, roughness: 0.2 })
  ), eid);
  return eid;
};
