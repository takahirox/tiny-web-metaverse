import {
  addComponent,
  addEntity,
  IWorld
} from "bitecs";
import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import { EntityObject3DProxy } from "@tiny-web-metaverse/client/src/components/entity_object3d";
import { Grabbable } from "@tiny-web-metaverse/client/src/components/grab";
import { MouseButtonEventListener } from "@tiny-web-metaverse/client/src/components/mouse";
import {
  NetworkedPosition,
  NetworkedQuaternion,
  NetworkedScale
} from "@tiny-web-metaverse/client/src/components/network";
import { Raycastable } from "@tiny-web-metaverse/client/src/components/raycast";
import { InScene } from "@tiny-web-metaverse/client/src/components/scene";
import { Selectable } from "@tiny-web-metaverse/client/src/components/select";

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
