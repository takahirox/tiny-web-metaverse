import {
  addComponent,
  addEntity
} from "bitecs";
import {
  App,
  ConnectedStreamEventListener,
  createNetworkedEntity,
  GltfSceneLoader,
  GltfSceneLoaderProxy,
  EntityObject3DProxy,
  InScene,
  JoinedStreamEventListener,
  KeyEventListener,
  MouseButtonEventListener,
  NetworkedType,
  registerPrefab,
  SceneEnvironmentMapLoader,
  SceneEnvironmentMapLoaderProxy,
  SelectedEventListener,
  SystemOrder,
  UserNetworkEventListener
} from "@tiny-web-metaverse/client/src";
import { JoinDialog } from "./components/join_dialog";
import { SideBar } from "./components/side_bar";
import { UserEventHandler } from "./components/user_event_handler";
import { AvatarPrefab } from "./prefabs/avatar";
import { CubePrefab } from "./prefabs/cube";
import { DuckPrefab } from "./prefabs/duck";
import { colorSystem } from "./systems/color";
import { userEventSystem } from "./systems/user";
import { updateJoinDialogSystem } from "./ui/join_dialog";
import { updateSidebarSystem } from "./ui/side_bar";

const sceneAssetUrl = 'assets/scenes/hello_webxr.glb';

const url = new URL(location.href);

const reloadWithRoomIdIfNeeded = async (): Promise<void> => {
  if (!url.searchParams.has('room_id')) {
    url.searchParams.set('room_id', (Math.random() * 1000).toFixed(0));
    location.href = url.href;
    // Never return
    await new Promise(() => {});
  }
};

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  return canvas;
};

const run = async (): Promise<void> => {
  await reloadWithRoomIdIfNeeded();

  const roomId = url.searchParams.get('room_id');
  const canvas = createCanvas();

  const app = new App({ canvas, roomId });

  document.body.appendChild(canvas);

  app.registerSystem(updateJoinDialogSystem, SystemOrder.BeforeMatricesUpdate);
  app.registerSystem(updateSidebarSystem, SystemOrder.BeforeMatricesUpdate);
  app.registerSystem(colorSystem, SystemOrder.Render - 1);
  app.registerSystem(userEventSystem, SystemOrder.Render - 1);

  const world = app.getWorld();

  registerPrefab(world, 'avatar', AvatarPrefab);
  registerPrefab(world, 'cube', CubePrefab);
  registerPrefab(world, 'duck', DuckPrefab);

  const sceneEid = addEntity(world);
  addComponent(world, InScene, sceneEid);
  addComponent(world, GltfSceneLoader, sceneEid);
  GltfSceneLoaderProxy.get(sceneEid).allocate(sceneAssetUrl);

  const avatarEid = createNetworkedEntity(world, NetworkedType.Local, 'avatar');
  EntityObject3DProxy.get(avatarEid).root.position.set(0.0, 0.25, 2.0);
  addComponent(world, KeyEventListener, avatarEid);

  const envMapLoaderEid = addEntity(world);
  addComponent(world, SceneEnvironmentMapLoader, envMapLoaderEid);
  SceneEnvironmentMapLoaderProxy.get(envMapLoaderEid).allocate('assets/textures/royal_esplanade_1k.hdr');

  const mouseButtonEventEid = addEntity(world);
  addComponent(world, MouseButtonEventListener, mouseButtonEventEid);

  const userEventHandlerEid = addEntity(world);
  addComponent(world, UserEventHandler, userEventHandlerEid);
  addComponent(world, UserNetworkEventListener, userEventHandlerEid);

  const sideBarEid = addEntity(world);
  addComponent(world, SideBar, sideBarEid);
  addComponent(world, SelectedEventListener, sideBarEid);

  const joinDialogEid = addEntity(world);
  addComponent(world, JoinDialog, joinDialogEid);
  addComponent(world, ConnectedStreamEventListener, joinDialogEid);
  addComponent(world, JoinedStreamEventListener, joinDialogEid);

  const cubeEid = createNetworkedEntity(world, NetworkedType.Shared, 'cube');
  EntityObject3DProxy.get(cubeEid).root.position.set(
    (Math.random() - 0.5) * 10.0,
    0.25,
    (Math.random() - 0.5) * 10.0
  );

  const duckEid = createNetworkedEntity(world, NetworkedType.Shared, 'duck');
  EntityObject3DProxy.get(duckEid).root.position.set(
    (Math.random() - 0.5) * 10.0,
    0.1,
    (Math.random() - 0.5) * 10.0
  );

  app.start();
};

run();
