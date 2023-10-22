import {
  addComponent,
  addEntity
} from "bitecs";
import {
  avatarVirtualJoystickSystem,
  billboardSystem,
  clearVirtualJoystickEventSystem,
  gltfMixerAnimationSystem,
  imageSystem,
  imageLoadSystem,
  lazilyUpdateVideoStateSystem,
  nametagSystem,
  NetworkedVideo,
  videoSystem,
  videoLoadSystem,
  videoSerializers,
  VirtualJoystick,
  VirtualJoystickLeft,
  VirtualJoystickProxy,
  VirtualJoystickRight,
  virtualJoystickUISystem,
  TextChat,
  textChatUISystem,
  textSystem,
  WebXRARButton,
  webXrButtonsUISystem,
  WebXRVRButton
} from "@tiny-web-metaverse/addons/src";
import {
  App,
  AudioDestination,
  BroadcastNetworkEventListener,
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
  registerSerializers,
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
import { FoxPrefab } from "./prefabs/fox";
import { ImagePrefab } from "./prefabs/image";
import { VideoPrefab } from "./prefabs/video";

import { colorSystem } from "./systems/color";
import { userEventSystem } from "./systems/user";

import { updateJoinDialogSystem } from "./ui/join_dialog";
import { updateSidebarSystem } from "./ui/side_bar";

import { isMobile, isTablet } from "./utils/platform_detect";

const sceneAssetUrl = 'assets/scenes/hello_webxr.glb';
const envTextureUrl = 'assets/textures/royal_esplanade_1k.hdr';

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

  app.registerSystem(virtualJoystickUISystem, SystemOrder.EventHandling);
  app.registerSystem(webXrButtonsUISystem, SystemOrder.EventHandling);

  app.registerSystem(textChatUISystem, SystemOrder.Setup);
  app.registerSystem(imageSystem, SystemOrder.Setup);
  app.registerSystem(imageLoadSystem, SystemOrder.Setup);
  app.registerSystem(videoSystem, SystemOrder.Setup);
  app.registerSystem(videoLoadSystem, SystemOrder.Setup);

  app.registerSystem(gltfMixerAnimationSystem, SystemOrder.Setup + 1);
  app.registerSystem(lazilyUpdateVideoStateSystem, SystemOrder.Setup + 1);

  app.registerSystem(updateJoinDialogSystem, SystemOrder.BeforeMatricesUpdate);
  app.registerSystem(updateSidebarSystem, SystemOrder.BeforeMatricesUpdate);
  app.registerSystem(avatarVirtualJoystickSystem, SystemOrder.BeforeMatricesUpdate);
  app.registerSystem(textSystem, SystemOrder.BeforeMatricesUpdate);

  app.registerSystem(nametagSystem, SystemOrder.MatricesUpdate - 1);
  app.registerSystem(billboardSystem, SystemOrder.MatricesUpdate - 1);

  app.registerSystem(colorSystem, SystemOrder.Render - 1);
  app.registerSystem(userEventSystem, SystemOrder.Render - 1);

  app.registerSystem(clearVirtualJoystickEventSystem, SystemOrder.TearDown);

  const world = app.getWorld();

  registerPrefab(world, 'avatar', AvatarPrefab);
  registerPrefab(world, 'cube', CubePrefab);
  registerPrefab(world, 'duck', DuckPrefab);
  registerPrefab(world, 'fox', FoxPrefab);
  registerPrefab(world, 'image', ImagePrefab);
  registerPrefab(world, 'video', VideoPrefab);

  registerSerializers(world, 'video', NetworkedVideo, videoSerializers);

  const sceneEid = addEntity(world);
  addComponent(world, InScene, sceneEid);
  addComponent(world, GltfSceneLoader, sceneEid);
  GltfSceneLoaderProxy.get(sceneEid).allocate(sceneAssetUrl);

  const avatarEid = createNetworkedEntity(world, NetworkedType.Local, 'avatar');
  EntityObject3DProxy.get(avatarEid).root.position.set(0.0, 0.25, 2.0);
  addComponent(world, KeyEventListener, avatarEid);
  addComponent(world, AudioDestination, avatarEid);

  const envMapLoaderEid = addEntity(world);
  addComponent(world, SceneEnvironmentMapLoader, envMapLoaderEid);
  SceneEnvironmentMapLoaderProxy.get(envMapLoaderEid).allocate(envTextureUrl);

  if (isMobile() || isTablet()) {
    const virtualJoystickLeftEid = addEntity(world);
    addComponent(world, VirtualJoystick, virtualJoystickLeftEid);
    VirtualJoystickProxy.get(virtualJoystickLeftEid).allocate();
    addComponent(world, VirtualJoystickLeft, virtualJoystickLeftEid);

    const virtualJoystickRightEid = addEntity(world);
    addComponent(world, VirtualJoystick, virtualJoystickRightEid);
    VirtualJoystickProxy.get(virtualJoystickRightEid).allocate();
    addComponent(world, VirtualJoystickRight, virtualJoystickRightEid);
  }

  const textChatEid = addEntity(world);
  addComponent(world, TextChat, textChatEid);
  addComponent(world, BroadcastNetworkEventListener, textChatEid);
  addComponent(world, UserNetworkEventListener, textChatEid);

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

  const vrButtonEid = addEntity(world);
  addComponent(world, WebXRVRButton, vrButtonEid);

  const arButtonEid = addEntity(world);
  addComponent(world, WebXRARButton, arButtonEid);

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

  const foxEid = createNetworkedEntity(world, NetworkedType.Shared, 'fox');
  EntityObject3DProxy.get(foxEid).root.position.set(
    (Math.random() - 0.5) * 10.0,
    0.1,
    (Math.random() - 0.5) * 10.0
  );

  const imageEid = createNetworkedEntity(world, NetworkedType.Shared, 'image');
  EntityObject3DProxy.get(imageEid).root.position.set(
    (Math.random() - 0.5) * 10.0,
    0.5,
    (Math.random() - 0.5) * 10.0
  );

  // Commenting out because of bad performance
/*
  const videoEid = createNetworkedEntity(world, NetworkedType.Shared, 'video');
  EntityObject3DProxy.get(videoEid).root.position.set(
    (Math.random() - 0.5) * 10.0,
    0.5,
    (Math.random() - 0.5) * 10.0
  );
*/
  app.start();
};

run();
