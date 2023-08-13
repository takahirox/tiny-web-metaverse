import {
  addComponent,
  addEntity,
  IWorld
} from "bitecs";
import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import {
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

export const CubePrefab = (world: IWorld): number => {
  const eid = addEntity(world);
  addComponent(world, NetworkedPosition, eid);
  addComponent(world, NetworkedQuaternion, eid);
  addComponent(world, NetworkedScale, eid);
  addComponent(world, Raycastable, eid);
  addComponent(world, MouseButtonEventListener, eid);
  addComponent(world, Grabbable, eid);
  addComponent(world, Selectable, eid);
  addComponent(world, InScene, eid);
  EntityObject3DProxy.get(eid).addObject3D(world, new Mesh(
    new BoxGeometry(0.5, 0.5, 0.5),
    new MeshBasicMaterial()
  ));
  return eid;
};
