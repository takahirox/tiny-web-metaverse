import {
  addComponent,
  addEntity,
  createWorld,
  IWorld
} from "bitecs";
import {
  Clock,
  Color,
  MathUtils,
  PerspectiveCamera,
  Raycaster,
  Scene,
  WebGLRenderer
} from "three";

import { StateAdapter } from "@tiny-web-metaverse/state_client";
import { StreamAdapter } from "@tiny-web-metaverse/stream_client";

import { System, SystemOrder } from "./common";

import {
  AudioContextComponent,
  AudioContextProxy,
  AudioContextSuspended
} from "./components/audio_effect";
import {
  AvatarMouseControls,
  AvatarMouseControlsProxy
} from "./components/avatar_mouse_controls";
import { Canvas, CanvasProxy } from "./components/canvas";
import {
  FpsCamera,
  PerspectiveCameraComponent,
  PerspectiveCameraProxy,
  SceneCamera
} from "./components/camera";
import {
  MouseButtonEventHandler,
  MouseButtonEventHandlerProxy,
  MouseButtonEventListener,
  MouseMoveEventHandler,
  MouseMoveEventHandlerProxy,
  MouseMoveEventListener,
  MousePosition,
  MousePositionProxy,
  PreviousMousePosition,
  PreviousMousePositionProxy
} from "./components/mouse";
import { KeyEventHandler } from "./components/keyboard";
import {
  ComponentNetworkEventListener,
  EntityNetworkEventListener,
  Local,
  NetworkedEntityManager,
  NetworkedEntityManagerProxy,
  NetworkedMixerAnimation,
  NetworkedPosition,
  NetworkedQuaternion,
  NetworkedScale,
  NetworkEventReceiver,
  NetworkEventSender,
  StateClient,
  StateClientProxy,
  UserNetworkEventListener
} from "./components/network";
import { Pointer, PointerProxy } from "./components/pointer";
import { Prefabs, PrefabsProxy } from "./components/prefab";
import { RaycasterComponent, RaycasterProxy } from "./components/raycast";
import { Renderer, RendererProxy } from "./components/renderer";
import { RoomId, RoomIdProxy } from "./components/room_id";
import {
  TouchEventHandler,
  TouchEventHandlerProxy,
  TouchEventListener,
  TouchMoveEventHandler,
  TouchMoveEventHandlerProxy,
  TouchMoveEventListener,
  TouchPosition,
  TouchPositionProxy
} from "./components/touch";
import { UserId, UserIdProxy } from "./components/user_id";
import { InScene, SceneProxy, SceneComponent } from "./components/scene";
import {
  ComponentKeys,
  ComponentKeysProxy,
  Serializers,
  SerializersProxy
} from "./components/serializer";
import {
  ConnectedStreamEventListener,
  ExitedPeerStreamEventListener,
  JoinedPeerStreamEventListener,
  LeftPeerStreamEventListener,
  NewConsumerStreamEventListener,
  NewPeerStreamEventListener,
  StreamClient,
  StreamClientProxy,
  StreamRemotePeerRegister,
  StreamEventReceiver,
  StreamRemotePeers,
  StreamRemotePeersProxy
} from "./components/stream";
import { Time, TimeProxy } from "./components/time";
import {
  WindowResizeEventHandler,
  WindowResizeEventListener,
  WindowSize
} from "./components/window_resize";

import {
  positionSerializers,
  quaternionSerializers,
  scaleSerializers
} from "./serializations/transform";
import { mixerAnimationSerializers } from "./serializations/mixer_animation";

import { resumeAudioContextSystem } from "./systems/audio_context";
import { avatarKeyControlsSystem } from "./systems/avatar_key_controls";
import { avatarMouseControlsSystem } from "./systems/avatar_mouse_controls";
import { canvasSystem } from "./systems/canvas";
import { entityObject3DSystem } from "./systems/entity_object3d";
import { fpsCameraSystem } from "./systems/fps_camera";
import { gltfSystem } from "./systems/gltf";
import { gltfAssetLoadSystem } from "./systems/gltf_asset_load";
import { gltfSceneLoadSystem } from "./systems/gltf_scene_load";
import { grabSystem } from "./systems/grab";
import { grabbedObjectsPointerTrackSystem } from "./systems/grab_pointer_track";
import { clearInteractionSystem } from "./systems/interacted";
import {
  keyEventHandleSystem,
  keyEventClearSystem
} from "./systems/keyboard_event";
import { lazilyActivateAnimationSystem } from "./systems/lazily_activate_animation";
import { linearMoveSystem } from "./systems/linear_move";
import { linearTransformSystem } from "./systems/linear_transform";
import { micRequestSystem, micEventClearSystem } from "./systems/media_device";
import {
  clearActiveAnimationsUpdatedSystem,
  mixerAnimationSystem
} from "./systems/mixer_animation";
import {
  mouseButtonEventClearSystem,
  mouseButtonEventHandleSystem
} from "./systems/mouse_button_event";
import {
  mouseMoveEventClearSystem,
  mouseMoveEventHandleSystem
} from "./systems/mouse_move_event";
import { mousePositionToPointerSystem } from "./systems/mouse_position_to_pointer";
import { mousePositionTrackSystem } from "./systems/mouse_position_track";
import { mouseInteractSystem } from "./systems/mouse_interact";
import { networkEventClearSystem, networkEventHandleSystem } from "./systems/network_event";
import { networkSendSystem } from "./systems/network_send";
import { networkedSystem } from "./systems/networked";
import { networkedEntitySystem } from "./systems/networked_entity";
import { perspectiveCameraSystem } from "./systems/perspective_camera";
import { positionalAudioSystem } from "./systems/positional_audio";
import { prefabsSystem } from "./systems/prefab";
import { clearRaycastedSystem, raycastSystem } from "./systems/raycast";
import { raycasterSystem } from "./systems/raycaster";
import { renderSystem } from "./systems/render";
import { rendererSystem } from "./systems/renderer";
import { sceneSystem } from "./systems/scene";
import { sceneEnvironmentMapLoadSystem } from "./systems/scene_environment_map_load";
import { selectedEventClearSystem, selectSystem } from "./systems/select";
import { streamConnectionSystem } from "./systems/stream_connection";
import { streamRemotePeerRegisterSystem } from "./systems/stream_remote_peers";
import { streamEventClearSystem, streamEventHandleSystem } from "./systems/stream_event";
import { timeSystem } from "./systems/time";
import {
  touchEventClearSystem,
  touchEventHandleSystem
} from "./systems/touch_event";
import { touchInteractSystem } from "./systems/touch_interact";
import {
  touchMoveEventClearSystem,
  touchMoveEventHandleSystem
} from "./systems/touch_move_event";
import { touchPositionToPointerSystem } from "./systems/touch_position_to_pointer";
import { touchPositionTrackSystem } from "./systems/touch_position_track";
import { clearTransformUpdatedSystem } from "./systems/transform";
import { updateMatricesSystem } from "./systems/update_matrices";
import {
  windowResizeEventHandleSystem,
  windowResizeEventClearSystem
} from "./systems/window_resize_event";

import { addObject3D } from "./utils/entity_object3d";
import { registerSerializers } from "./utils/serializer";

type RegisteredSystem = {
  system: System;
  orderPriority: number;
};

export class App {
  private systems: RegisteredSystem[];
  private world: IWorld;
  private networkAdapter: StateAdapter;
  private streamAdapter: StreamAdapter;
  readonly userId: string;

  constructor(params: {
    canvas: HTMLCanvasElement,
    roomId: string,
    userId?: string
  }) {
    const roomId = params.roomId;
    const userId = params.userId || MathUtils.generateUUID();
    const canvas = params.canvas;

    // TODO: Custom server URL support
    this.networkAdapter = new StateAdapter({ roomId, userId });
    this.streamAdapter = new StreamAdapter();

    this.systems = [];
    this.world = createWorld();

    this.init(canvas, roomId, userId);
  }

  private init(
    canvas: HTMLCanvasElement,
    roomId: string,
    userId: string
  ): void {
    // TODO: Configurable renderer parameters
    const renderer = new WebGLRenderer({ antialias: true, canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Built-in systems and entities

    this.registerSystem(timeSystem, SystemOrder.Time);

    this.registerSystem(micRequestSystem, SystemOrder.EventHandling);
    this.registerSystem(keyEventHandleSystem, SystemOrder.EventHandling);
    this.registerSystem(mouseMoveEventHandleSystem, SystemOrder.EventHandling);
    this.registerSystem(mouseButtonEventHandleSystem, SystemOrder.EventHandling);
    this.registerSystem(touchMoveEventHandleSystem, SystemOrder.EventHandling);
    this.registerSystem(touchEventHandleSystem, SystemOrder.EventHandling);
    this.registerSystem(windowResizeEventHandleSystem, SystemOrder.EventHandling);
    this.registerSystem(networkEventHandleSystem, SystemOrder.EventHandling);
    this.registerSystem(streamEventHandleSystem, SystemOrder.EventHandling);
    this.registerSystem(streamConnectionSystem, SystemOrder.EventHandling);

    this.registerSystem(mousePositionTrackSystem, SystemOrder.EventHandling + 1);
    this.registerSystem(touchPositionTrackSystem, SystemOrder.EventHandling + 1);

    this.registerSystem(mousePositionToPointerSystem, SystemOrder.EventHandling + 2);
    this.registerSystem(touchPositionToPointerSystem, SystemOrder.EventHandling + 2);

    this.registerSystem(canvasSystem, SystemOrder.Setup);
    this.registerSystem(prefabsSystem, SystemOrder.Setup);
    this.registerSystem(raycasterSystem, SystemOrder.Setup);
    this.registerSystem(rendererSystem, SystemOrder.Setup);
    this.registerSystem(entityObject3DSystem, SystemOrder.Setup);
    this.registerSystem(sceneSystem, SystemOrder.Setup);
    this.registerSystem(perspectiveCameraSystem, SystemOrder.Setup);
    this.registerSystem(gltfAssetLoadSystem, SystemOrder.Setup);
    this.registerSystem(gltfSceneLoadSystem, SystemOrder.Setup);
    this.registerSystem(gltfSystem, SystemOrder.Setup);
    this.registerSystem(sceneEnvironmentMapLoadSystem, SystemOrder.Setup);
    this.registerSystem(mixerAnimationSystem, SystemOrder.Setup);
    this.registerSystem(networkedSystem, SystemOrder.Setup);
    this.registerSystem(networkedEntitySystem, SystemOrder.Setup);
    this.registerSystem(streamRemotePeerRegisterSystem, SystemOrder.Setup);
    this.registerSystem(resumeAudioContextSystem, SystemOrder.Setup);
    this.registerSystem(lazilyActivateAnimationSystem, SystemOrder.Setup + 1);

    this.registerSystem(linearMoveSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(linearTransformSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(raycastSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(mouseInteractSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(touchInteractSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(selectSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(grabSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(grabbedObjectsPointerTrackSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(avatarKeyControlsSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(avatarMouseControlsSystem, SystemOrder.BeforeMatricesUpdate);

    this.registerSystem(fpsCameraSystem, SystemOrder.MatricesUpdate - 1);
    this.registerSystem(networkSendSystem, SystemOrder.MatricesUpdate - 1);

    this.registerSystem(updateMatricesSystem, SystemOrder.MatricesUpdate);

    this.registerSystem(positionalAudioSystem, SystemOrder.MatricesUpdate + 1);

    this.registerSystem(renderSystem, SystemOrder.Render);

    this.registerSystem(keyEventClearSystem, SystemOrder.TearDown);
    this.registerSystem(mouseMoveEventClearSystem, SystemOrder.TearDown);
    this.registerSystem(mouseButtonEventClearSystem, SystemOrder.TearDown);
    this.registerSystem(touchMoveEventClearSystem, SystemOrder.TearDown);
    this.registerSystem(touchEventClearSystem, SystemOrder.TearDown);
    this.registerSystem(selectedEventClearSystem, SystemOrder.TearDown);
    this.registerSystem(micEventClearSystem, SystemOrder.TearDown);
    this.registerSystem(windowResizeEventClearSystem, SystemOrder.TearDown);
    this.registerSystem(networkEventClearSystem, SystemOrder.TearDown);
    this.registerSystem(streamEventClearSystem, SystemOrder.TearDown);
    this.registerSystem(clearRaycastedSystem, SystemOrder.TearDown);
    this.registerSystem(clearTransformUpdatedSystem, SystemOrder.TearDown);
    this.registerSystem(clearActiveAnimationsUpdatedSystem, SystemOrder.TearDown);
    this.registerSystem(clearInteractionSystem, SystemOrder.TearDown);

    // Entity 0 for null entity
    addEntity(this.world);

    const timeEid = addEntity(this.world);
    addComponent(this.world, Time, timeEid);
    TimeProxy.get(timeEid).allocate(new Clock(), 0, 0);

    const audioContext = new AudioContext();
    const audioContextEid = addEntity(this.world);
    addComponent(this.world, AudioContextComponent, audioContextEid);
    AudioContextProxy.get(audioContextEid).allocate(audioContext);

    if (audioContext.state === 'suspended') {
      addComponent(this.world, AudioContextSuspended, audioContextEid);
    }

    const prefabsEid = addEntity(this.world);
    addComponent(this.world, Prefabs, prefabsEid);
    PrefabsProxy.get(prefabsEid).allocate();

    const serializersEid = addEntity(this.world);
    addComponent(this.world, Serializers, serializersEid);
    SerializersProxy.get(serializersEid).allocate();

    const componentKeysEid = addEntity(this.world);
    addComponent(this.world, ComponentKeys, componentKeysEid);
    ComponentKeysProxy.get(componentKeysEid).allocate();

    const roomIdEid = addEntity(this.world);
    addComponent(this.world, RoomId, roomIdEid);
    RoomIdProxy.get(roomIdEid).allocate(roomId);

    const userIdEid = addEntity(this.world);
    addComponent(this.world, UserId, userIdEid);
    UserIdProxy.get(userIdEid).allocate(userId);
    addComponent(this.world, Local, userIdEid);

    const streamRemotePeersEid = addEntity(this.world);
    addComponent(this.world, StreamRemotePeers, streamRemotePeersEid);
    StreamRemotePeersProxy.get(streamRemotePeersEid).allocate();

    const streamRemotePeerRegisterEid = addEntity(this.world);
    addComponent(this.world, StreamRemotePeerRegister, streamRemotePeerRegisterEid);
    addComponent(this.world, ConnectedStreamEventListener, streamRemotePeerRegisterEid);
    addComponent(this.world, NewPeerStreamEventListener, streamRemotePeerRegisterEid);
    addComponent(this.world, JoinedPeerStreamEventListener, streamRemotePeerRegisterEid);
    addComponent(this.world, LeftPeerStreamEventListener, streamRemotePeerRegisterEid);
    addComponent(this.world, ExitedPeerStreamEventListener, streamRemotePeerRegisterEid);
    addComponent(this.world, NewConsumerStreamEventListener, streamRemotePeerRegisterEid);

    const keyEventHandlerEid = addEntity(this.world);
    addComponent(this.world, KeyEventHandler, keyEventHandlerEid);

    const mouseMoveEventHandlerEid = addEntity(this.world);
    addComponent(this.world, MouseMoveEventHandler, mouseMoveEventHandlerEid);
    MouseMoveEventHandlerProxy.get(mouseMoveEventHandlerEid).init(canvas);

    const mouseButtonEventHandlerEid = addEntity(this.world);
    addComponent(this.world, MouseButtonEventHandler, mouseButtonEventHandlerEid);
    MouseButtonEventHandlerProxy.get(mouseButtonEventHandlerEid).init(canvas);

    const touchMoveEventHandlerEid = addEntity(this.world);
    addComponent(this.world, TouchMoveEventHandler, touchMoveEventHandlerEid);
    TouchMoveEventHandlerProxy.get(touchMoveEventHandlerEid).init(canvas);

    const touchEventHandlerEid = addEntity(this.world);
    addComponent(this.world, TouchEventHandler, touchEventHandlerEid);
    TouchEventHandlerProxy.get(touchEventHandlerEid).init(canvas);

    const resizeEventHandlerEid = addEntity(this.world);
    addComponent(this.world, WindowResizeEventHandler, resizeEventHandlerEid);

    const networkAdapterEid = addEntity(this.world);
    addComponent(this.world, StateClient, networkAdapterEid);
    StateClientProxy.get(networkAdapterEid).allocate(this.networkAdapter);

    const streamClientEid = addEntity(this.world);
    addComponent(this.world, StreamClient, streamClientEid);
    StreamClientProxy.get(streamClientEid).allocate(this.streamAdapter);

    const networkEventReceiverEid = addEntity(this.world);
    addComponent(this.world, NetworkEventReceiver, networkEventReceiverEid);

    const networkEventSenderEid = addEntity(this.world);
    addComponent(this.world, NetworkEventSender, networkEventSenderEid);
    NetworkEventSender.lastSendTime[networkEventSenderEid] = 0.0;

    const streamEventReceiverEid = addEntity(this.world);
    addComponent(this.world, StreamEventReceiver, streamEventReceiverEid);

    const networkedEntityManagerEid = addEntity(this.world);
    addComponent(this.world, NetworkedEntityManager, networkedEntityManagerEid);
    NetworkedEntityManagerProxy.get(networkedEntityManagerEid).allocate();
    addComponent(this.world, ComponentNetworkEventListener, networkedEntityManagerEid);
    addComponent(this.world, EntityNetworkEventListener, networkedEntityManagerEid);
    addComponent(this.world, UserNetworkEventListener, networkedEntityManagerEid);

    const pointerEid = addEntity(this.world);
    addComponent(this.world, Pointer, pointerEid);
    PointerProxy.get(pointerEid).allocate();

    const mousePositionEid = addEntity(this.world);
    addComponent(this.world, MousePosition, mousePositionEid);
    MousePositionProxy.get(mousePositionEid).allocate();
    addComponent(this.world, PreviousMousePosition, mousePositionEid);
    PreviousMousePositionProxy.get(mousePositionEid).allocate();
    addComponent(this.world, MouseMoveEventListener, mousePositionEid);

    const touchPositionEid = addEntity(this.world);
    addComponent(this.world, TouchPosition, touchPositionEid);
    TouchPositionProxy.get(touchPositionEid).allocate();
    addComponent(this.world, TouchEventListener, touchPositionEid);
    addComponent(this.world, TouchMoveEventListener, touchPositionEid);

    const raycasterEid = addEntity(this.world);
    addComponent(this.world, RaycasterComponent, raycasterEid);
    RaycasterProxy.get(raycasterEid).allocate(new Raycaster());

    const avatarMouseControlsEid = addEntity(this.world);
    addComponent(this.world, AvatarMouseControls, avatarMouseControlsEid);
    AvatarMouseControlsProxy.get(avatarMouseControlsEid).allocate();
    addComponent(this.world, MouseButtonEventListener, avatarMouseControlsEid);

    const canvasEid = addEntity(this.world);
    addComponent(this.world, Canvas, canvasEid);
    CanvasProxy.get(canvasEid).allocate(canvas);

    const rendererEid = addEntity(this.world);
    addComponent(this.world, Renderer, rendererEid);
    RendererProxy.get(rendererEid).allocate(renderer);
    addComponent(this.world, WindowSize, rendererEid);
    addComponent(this.world, WindowResizeEventListener, rendererEid);

    const sceneEid = addEntity(this.world);
    addComponent(this.world, SceneComponent, sceneEid);

    // TODO: Configurable Scene
    const scene = new Scene();
    // Matrices are updated in updateMatricesSystem.
    scene.matrixWorldAutoUpdate = false;
    scene.background = new Color(0xffffff);

    SceneProxy.get(sceneEid).allocate(scene);

    const cameraEid = addEntity(this.world);

    // TODO: Configurable
    const camera = new PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.001,
      2000.0
    );

    addComponent(this.world, PerspectiveCameraComponent, cameraEid);
    PerspectiveCameraProxy.get(cameraEid).allocate(camera);
    addObject3D(this.world, camera, cameraEid);

    addComponent(this.world, FpsCamera, cameraEid);
    addComponent(this.world, InScene, cameraEid);
    addComponent(this.world, SceneCamera, cameraEid);
    addComponent(this.world, WindowSize, cameraEid);
    addComponent(this.world, WindowResizeEventListener, cameraEid);

    // Serializers

    registerSerializers(this.world, 'position', NetworkedPosition, positionSerializers);
    registerSerializers(this.world, 'quaternion', NetworkedQuaternion, quaternionSerializers);
    registerSerializers(this.world, 'scale', NetworkedScale, scaleSerializers);
    registerSerializers(this.world, 'mixer_animation', NetworkedMixerAnimation, mixerAnimationSerializers);
  }

  registerSystem(
    system: System,
    orderPriority: number = SystemOrder.BeforeMatricesUpdate
  ): void {
    // TODO: Optimize
    for (const s of this.systems) {
      if (s.system === system) {
        throw new Error(`${system.name} system is already registered.`);
      }
    }
    this.systems.push({system, orderPriority});
    this.systems.sort((a, b) => {
      return a.orderPriority - b.orderPriority;
    });
  }

  deregisterSystem(system: System): void {
    // TODO: Optimize
    let index = -1;
    for (let i = 0; i < this.systems.length; i++) {
      if (this.systems[i].system === system) {
        index = i;
        break;
      }
    }

    if (index === -1) {
      throw new Error(`${system.name} system is not registered.`);
    } else {
      this.systems.splice(index, 1);
    }
  }

  getSystemOrderPriority(system: System): number {
    // TODO: Optimize
    for (let i = 0; i < this.systems.length; i++) {
      if (this.systems[i].system === system) {
        return this.systems[i].orderPriority;
      }
    }
    throw new Error(`${system.name} system is not registered.`);
  }

  tick() {
    for (const system of this.systems) {
      system.system(this.world);
    }
  }

  start() {
    const runTick = () => {
      // TODO: Use WebGLRenderer setAnimation
      requestAnimationFrame(runTick);
      this.tick();
    };
    runTick();
  }

  getWorld(): IWorld {
    return this.world;
  }
}
