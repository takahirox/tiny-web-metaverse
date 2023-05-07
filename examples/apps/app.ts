import {
  addComponent,
  addEntity
} from "bitecs";
import { App } from "../../src/app";
import { KeyEventListener } from "../../src/components/keyboard";
import { MouseButtonEventListener } from "../../src/components/mouse";
import { SystemOrder } from "../../src/common";
import { KeyEventEntityCreator } from "../components/key_event_entity_creator";
import { MouseButtonEventEntityCreator } from "../components/mouse_button_event_entity_creator";
import { keyEventCreateEntitySystem } from "../systems/key_event_entity_create";
import { mouseButtonEventCreateEntitySystem } from "../systems/mouse_button_event_entity_create";
import { velocitySystem } from "../systems/velocity";

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

app.start();

export { app };
