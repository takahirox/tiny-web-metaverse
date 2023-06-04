import {
  addComponent,
  addEntity,
  IWorld
} from "bitecs";
import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import { EntityObject3DProxy } from "../../src/components/entity_object3d";
import { Grabbable } from "../../src/components/grab";
import { MouseButtonEventListener } from "../../src/components/mouse";
import { Raycastable } from "../../src/components/raycast";
import { InScene } from "../../src/components/scene";
import { Selectable } from "../../src/components/select";

export const CubePrefab = (world: IWorld): number => {
  const eid = addEntity(world);
  addComponent(world, Raycastable, eid);
  addComponent(world, MouseButtonEventListener, eid);
  addComponent(world, Grabbable, eid);
  addComponent(world, Selectable, eid);
  addComponent(world, InScene, eid);
  EntityObject3DProxy.get(eid).addObject3D(world, new Mesh(
    new BoxGeometry(0.5, 0.5, 0.5),
    new MeshBasicMaterial()
  ));
  EntityObject3DProxy.get(eid).root.position.set(
    (Math.random() - 0.5) * 10.0,
    0.25,
    (Math.random() - 0.5) * 10.0
  );
  return eid;
};
