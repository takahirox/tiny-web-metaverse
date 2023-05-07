import {
  addComponent,
  addEntity
} from "bitecs";
import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import { App } from "../../src/app";
import { Avatar } from "../../src/components/avatar";
import { EntityObject3DProxy } from "../../src/components/entity_object3d";
import { KeyEventListener } from "../../src/components/keyboard";
import { MouseButtonEventListener } from "../../src/components/mouse";
import { Owned } from "../../src/components/network";
import { InScene } from "../../src/components/scene";
import { SystemOrder } from "../../src/common";
import { MouseButtonEventEntityCreator } from "../components/mouse_button_event_entity_creator";
import { mouseButtonEventCreateEntitySystem } from "../systems/mouse_button_event_entity_create";
import { velocitySystem } from "../systems/velocity";

const app = new App();
app.registerSystem(velocitySystem);
app.registerSystem(mouseButtonEventCreateEntitySystem, SystemOrder.EventHandling);

const world = app.getWorld();

const avatarEid = addEntity(world);
addComponent(world, Avatar, avatarEid);
addComponent(world, Owned, avatarEid);
addComponent(world, KeyEventListener, avatarEid);
addComponent(world, InScene, avatarEid);
EntityObject3DProxy.get(avatarEid).addObject3D(world, new Mesh(
  new BoxGeometry(0.5, 0.5, 0.5),
  new MeshBasicMaterial({ color: 0x0000ff })
));

const mouseButtonEventEid = addEntity(world);
addComponent(world, MouseButtonEventEntityCreator, mouseButtonEventEid);
addComponent(world, MouseButtonEventListener, mouseButtonEventEid);

app.start();

export { app };
