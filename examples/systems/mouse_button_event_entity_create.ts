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
import { MouseButtonEventEntityCreator } from "../components/mouse_button_event_entity_creator";
import { Velocity } from "../components/velocity";

const createEntity = (world: IWorld) => {
  const eid = addEntity(world);

  addComponent(world, Velocity, eid);
  Velocity.x[eid] = 0.01;
  Velocity.y[eid] = 0.0;
  Velocity.z[eid] = 0.0;

  EntityObject3DProxy.get(eid).addObject3D(world, new Mesh(
    new BoxGeometry(1.0, 1.0, 1.0),
    new MeshBasicMaterial({color: 0x888888})
  ));

  addComponent(world, InScene, eid);
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
