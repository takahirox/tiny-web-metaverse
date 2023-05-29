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
import { EntityObject3DProxy } from "../../src/components/entity_object3d";
import { Grabbable } from "../../src/components/grab";
import { KeyEventListener } from "../../src/components/keyboard";
import { MouseButtonEventListener } from "../../src/components/mouse";
import {
  Local,
  NetworkedInitProxy,
  UserNetworkEventListener
} from "../../src/components/network";
import { Raycastable } from "../../src/components/raycast";
import { InScene } from "../../src/components/scene";
import { Selectable } from "../../src/components/select";
import { SystemOrder } from "../../src/common";
import { generateUUID } from "../../src/utils/network";
import { AvatarPrefab } from "../prefabs/avatar";
import { colorSystem } from "../systems/color";
import { selectedObjectSystem } from "../systems/selected_object";
import { userEventSystem } from "../systems/user";
import { updateSidebarSystem } from "../ui/side_bar";

const app = new App();
document.body.appendChild(app.getCanvas());

app.registerSystem(updateSidebarSystem, SystemOrder.BeforeMatricesUpdate);
app.registerSystem(colorSystem, SystemOrder.Render - 1);
app.registerSystem(selectedObjectSystem, SystemOrder.Render - 1);
app.registerSystem(userEventSystem, SystemOrder.Render - 1);

app.registerPrefab('avatar', AvatarPrefab);

const world = app.getWorld();

const gridEid = addEntity(world);
addComponent(world, InScene, gridEid);
EntityObject3DProxy.get(gridEid).addObject3D(world, new GridHelper());

const avatarEid = AvatarPrefab(world);
EntityObject3DProxy.get(avatarEid).root.position.set(0.0, 0.25, 2.0);

NetworkedInitProxy.get(avatarEid).allocate(world, generateUUID(), 'avatar');
addComponent(world, Local, avatarEid);
addComponent(world, KeyEventListener, avatarEid);

const mouseButtonEventEid = addEntity(world);
addComponent(world, MouseButtonEventListener, mouseButtonEventEid);

const userNetworkEventEid = addEntity(world);
addComponent(world, UserNetworkEventListener, userNetworkEventEid);

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
