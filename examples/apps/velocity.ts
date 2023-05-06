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
import {
  MouseButtonEvent,
  MouseButtonEventListener,
  MouseButtonEventProxy,
  MouseButtonEventType
} from "../../src/components/mouse";
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

const KeyEventEntityCreator = defineComponent();
const keyEventQuery = defineQuery([KeyEvent, KeyEventEntityCreator]);
const keyEventCreateEntitySystem = (world: IWorld): void => {
  keyEventQuery(world).forEach(eid => {
    for (const e of KeyEventProxy.get(eid).events) {
      if (e.type === KeyEventType.Down) {
        createEntity(world);
      }
    }
  });
};

const MouseButtonEventEntityCreator = defineComponent();
const mouseButtonEventQuery = defineQuery([MouseButtonEvent, MouseButtonEventEntityCreator]);
const mouseButtonEventCreateEntitySystem = (world: IWorld): void => {
  mouseButtonEventQuery(world).forEach(eid => {
    for (const e of MouseButtonEventProxy.get(eid).events) {
      if (e.type === MouseButtonEventType.Down) {
        createEntity(world);
      }
    }
  });
};

const app = new App();
app.registerSystem(velocitySystem);
app.registerSystem(keyEventCreateEntitySystem, SystemOrder.EventHandling);
app.registerSystem(mouseButtonEventCreateEntitySystem, SystemOrder.EventHandling);

const world = app.getWorld();

const keyEventEid = addEntity(world);
addComponent(world, KeyEventEntityCreator, keyEventEid);
addComponent(world, KeyEventListener, keyEventEid);

const mouseButtonEventEid = addEntity(world);
addComponent(world, MouseButtonEventEntityCreator, mouseButtonEventEid);
addComponent(world, MouseButtonEventListener, mouseButtonEventEid);

createEntity(world);

app.start();

export { app };
