import {
  addComponent,
  addEntity,
  defineQuery,
  IWorld
} from "bitecs";
import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import { EntityObject3DProxy } from "../../src/components/entity_object3d";
import { InScene } from "../../src/components/scene";
import {
  MouseButtonEvent,
  MouseButtonEventProxy,
  MouseButtonEventType
} from "../../src/components/mouse";
import { Raycastable } from "../../src/components/raycast";
import { MouseButtonEventEntityCreator } from "../components/mouse_button_event_entity_creator";
import { Velocity } from "../components/velocity";

const createEntity = (world: IWorld) => {
  const eid = addEntity(world);

  addComponent(world, Velocity, eid);
  Velocity.x[eid] = Math.random() * 0.04 - 0.02;
  Velocity.y[eid] = 0.0;
  Velocity.z[eid] = Math.random() * -0.1;

  EntityObject3DProxy.get(eid).addObject3D(world, new Mesh(
    new BoxGeometry(0.5, 0.5, 0.5),
    new MeshBasicMaterial({color: 0x888888})
  ));
  EntityObject3DProxy.get(eid).root.position.y = 0.25;

  addComponent(world, InScene, eid);
  addComponent(world, Raycastable, eid);
};

const mouseButtonEventQuery =
  defineQuery([MouseButtonEvent, MouseButtonEventEntityCreator]);
export const mouseButtonEventCreateEntitySystem = (world: IWorld): void => {
  mouseButtonEventQuery(world).forEach(eid => {
    for (const e of MouseButtonEventProxy.get(eid).events) {
      if (e.type === MouseButtonEventType.Down) {
        createEntity(world);
      }
    }
  });
};
