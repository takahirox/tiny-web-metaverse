import {
  addComponent,
  addEntity
} from "bitecs";
import {
  BoxGeometry,
  GridHelper,
  Mesh,
  MeshBasicMaterial
} from "three";
import { App } from "../../src/app";
import { Avatar } from "../../src/components/avatar";
import { EntityObject3DProxy } from "../../src/components/entity_object3d";
import { Grabbable } from "../../src/components/grab";
import { KeyEventListener } from "../../src/components/keyboard";
import { MouseButtonEventListener } from "../../src/components/mouse";
import { Owned } from "../../src/components/network";
import { Raycastable } from "../../src/components/raycast";
import { InScene } from "../../src/components/scene";
import { Selectable } from "../../src/components/select";
import { SystemOrder } from "../../src/common";
import { colorSystem } from "../systems/color";
import { selectedObjectSystem } from "../systems/2d_ui/selected_object";

const app = new App();
app.registerSystem(colorSystem, SystemOrder.Render - 1);
app.registerSystem(selectedObjectSystem, SystemOrder.Render - 1);

const world = app.getWorld();

const gridEid = addEntity(world);
addComponent(world, InScene, gridEid);
EntityObject3DProxy.get(gridEid).addObject3D(world, new GridHelper());

const avatarEid = addEntity(world);
addComponent(world, Avatar, avatarEid);
addComponent(world, Owned, avatarEid);
addComponent(world, KeyEventListener, avatarEid);
addComponent(world, InScene, avatarEid);
EntityObject3DProxy.get(avatarEid).addObject3D(world, new Mesh(
  new BoxGeometry(0.5, 0.5, 0.5),
  new MeshBasicMaterial({ color: 0x0000ff })
));
EntityObject3DProxy.get(avatarEid).root.position.set(0.0, 0.25, 2.0);

const mouseButtonEventEid = addEntity(world);
addComponent(world, MouseButtonEventListener, mouseButtonEventEid);

for (let i = 0; i < 25; i++) {
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
}

app.start();

export { app };
