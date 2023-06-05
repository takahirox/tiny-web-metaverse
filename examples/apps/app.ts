import {
  addComponent,
  addEntity
} from "bitecs";
import { GridHelper } from "three";
import { App } from "../../src/app";
import { EntityObject3DProxy } from "../../src/components/entity_object3d";
import { KeyEventListener } from "../../src/components/keyboard";
import { MouseButtonEventListener } from "../../src/components/mouse";
import {
  NetworkedType,
  UserNetworkEventListener
} from "../../src/components/network";
import { InScene } from "../../src/components/scene";
import { SystemOrder } from "../../src/common";
import { setupNetworkedEntity } from "../../src/utils/network";
import { UserEventHandler } from "../components/user_event_handler";
import { AvatarPrefab } from "../prefabs/avatar";
import { CubePrefab } from "../prefabs/cube";
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
app.registerPrefab('cube', CubePrefab);

const world = app.getWorld();

const gridEid = addEntity(world);
addComponent(world, InScene, gridEid);
EntityObject3DProxy.get(gridEid).addObject3D(world, new GridHelper());

// TODO: Separately calling prefab function and passing a corresponding
//       prefab name to setupNetworkedEntity() sounds like duplicated. Fix me.
const avatarEid = AvatarPrefab(world);
EntityObject3DProxy.get(avatarEid).root.position.set(0.0, 0.25, 2.0);
addComponent(world, KeyEventListener, avatarEid);
setupNetworkedEntity(world, avatarEid, 'avatar', NetworkedType.Local);

const mouseButtonEventEid = addEntity(world);
addComponent(world, MouseButtonEventListener, mouseButtonEventEid);

const userEventHandlerEid = addEntity(world);
addComponent(world, UserEventHandler, userEventHandlerEid);
addComponent(world, UserNetworkEventListener, userEventHandlerEid);

const cubeEid = CubePrefab(world);
EntityObject3DProxy.get(cubeEid).root.position.set(
  (Math.random() - 0.5) * 10.0,
  0.25,
  (Math.random() - 0.5) * 10.0
);
setupNetworkedEntity(world, cubeEid, 'cube', NetworkedType.Shared);

app.start();

export { app };
