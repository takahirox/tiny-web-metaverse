import {
  addComponent,
  addEntity
} from "bitecs";
import { GridHelper } from "three";
import {
  App,
  createNetworkedEntity,
  EntityObject3DProxy,
  InScene,
  KeyEventListener,
  MouseButtonEventListener,
  NetworkedType,
  SystemOrder,
  UserNetworkEventListener
} from "@tiny-web-metaverse/client/src";
import { UserEventHandler } from "./components/user_event_handler";
import { AvatarPrefab } from "./prefabs/avatar";
import { CubePrefab } from "./prefabs/cube";
import { colorSystem } from "./systems/color";
import { selectedObjectSystem } from "./systems/selected_object";
import { userEventSystem } from "./systems/user";
import { updateSidebarSystem } from "./ui/side_bar";

const url = new URL(location.href);

const reloadWithRoomIdIfNeeded = async (): Promise<void> => {
  if (!url.searchParams.has('room_id')) {
    url.searchParams.set('room_id', (Math.random() * 1000).toFixed(0));
    location.href = url.href;
    // Never return
    await new Promise(() => {});
  }
};

const run = async (): Promise<void> => {
  await reloadWithRoomIdIfNeeded();

  const roomId = url.searchParams.get('room_id');

  const app = new App({roomId});
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

  const avatarEid = createNetworkedEntity(world, app, NetworkedType.Local, 'avatar');
  EntityObject3DProxy.get(avatarEid).root.position.set(0.0, 0.25, 2.0);
  addComponent(world, KeyEventListener, avatarEid);

  const mouseButtonEventEid = addEntity(world);
  addComponent(world, MouseButtonEventListener, mouseButtonEventEid);

  const userEventHandlerEid = addEntity(world);
  addComponent(world, UserEventHandler, userEventHandlerEid);
  addComponent(world, UserNetworkEventListener, userEventHandlerEid);

  const cubeEid = createNetworkedEntity(world, app, NetworkedType.Shared, 'cube');
  EntityObject3DProxy.get(cubeEid).root.position.set(
    (Math.random() - 0.5) * 10.0,
    0.25,
    (Math.random() - 0.5) * 10.0
  );

  app.start();
};

run();
