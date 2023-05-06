import {
  addComponent,
  addEntity,
  defineComponent,
  defineQuery,
  IWorld
} from "bitecs";
import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import { App } from "../../src/app";
import { EntityObject3DProxy } from "../../src/components/entity_object3d";
import { InScene } from "../../src/components/scene";
import {
  KeyEvent,
  KeyEventListener,
  KeyEventProxy,
  KeyEventType
} from "../../src/components/keyboard";
import { SystemOrder } from "../../src/common";
import { Velocity } from "../components/velocity";
import { velocitySystem } from "../systems/velocity";

const createEntity = (world: IWorld) => {
  const eid = addEntity(world);

  addComponent(world, Velocity, eid);
  Velocity.x[eid] = 0.0;
  Velocity.y[eid] = 0.01;
  Velocity.z[eid] = 0.0;

  EntityObject3DProxy.get(eid).addObject3D(world, new Mesh(
    new BoxGeometry(1.0, 1.0, 1.0),
    new MeshBasicMaterial({color: 0x888888})
  ));

  addComponent(world, InScene, eid);
};

const EntityCreator = defineComponent();
const keyEventQuery = defineQuery([KeyEvent, EntityCreator]);
const createEntitySystem = (world: IWorld): void => {
  keyEventQuery(world).forEach(eid => {
    for (const e of KeyEventProxy.get(eid).events) {
      if (e.type === KeyEventType.Down) {
        createEntity(world);
      }
    }
  });
};

const app = new App();
app.registerSystem(velocitySystem);
app.registerSystem(createEntitySystem, SystemOrder.EventHandling);

const world = app.getWorld();

const eid = addEntity(world);
addComponent(world, EntityCreator, eid);
addComponent(world, KeyEventListener, eid);

createEntity(world);

app.start();

export { app };
