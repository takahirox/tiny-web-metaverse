import {
  addComponent,
  addEntity,
  Component,
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
import {
  SerializerKeyMap,
  SerializersMap,
  Serializers,
  System,
  SystemParams,
  SystemOrder
} from "./common";
import {
  AvatarMouseControls,
  AvatarMouseControlsProxy
} from "./components/avatar_mouse_controls";
import { Canvas, CanvasProxy } from "./components/canvas";
import {
  FpsCamera,
  PerspectiveCameraTag,
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
  NetworkedEntityManager,
  NetworkedEntityManagerProxy,
  NetworkedPosition,
  NetworkedQuaternion,
  NetworkedScale,
  NetworkEventReceiver,
  NetworkEventSender,
  StateClient,
  StateClientProxy,
  UserNetworkEventListener
} from "./components/network";
import { Prefabs, PrefabsProxy } from "./components/prefab";
import { RaycasterTag, RaycasterProxy } from "./components/raycast";
import { Renderer, RendererProxy } from "./components/renderer";
import { RoomId, RoomIdProxy } from "./components/room_id";
import { UserId, UserIdProxy } from "./components/user_id";
import { InScene, SceneProxy, SceneTag } from "./components/scene";
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
import { avatarKeyControlsSystem } from "./systems/avatar_key_controls";
import { avatarMouseControlsSystem } from "./systems/avatar_mouse_controls";
import { canvasSystem } from "./systems/canvas";
import { entityObject3DSystem } from "./systems/entity_object3d";
import { fpsCameraSystem } from "./systems/fps_camera";
import { grabSystem } from "./systems/grab";
import { grabbedObjectsMouseTrackSystem } from "./systems/grab_mouse_track";
import {
  keyEventHandleSystem,
  keyEventClearSystem
} from "./systems/keyboard_event";
import { linearMoveSystem } from "./systems/linear_move";
import { linearTransformSystem } from "./systems/linear_transform";
import { micRequestSystem, micEventClearSystem } from "./systems/media_device";
import {
  mouseButtonEventClearSystem,
  mouseButtonEventHandleSystem
} from "./systems/mouse_button_event";
import {
  mouseMoveEventClearSystem,
  mouseMoveEventHandleSystem
} from "./systems/mouse_move_event";
import { mousePositionTrackSystem } from "./systems/mouse_position_track";
import { mouseRaycastSystem } from "./systems/mouse_raycast";
import { mouseSelectSystem } from "./systems/mouse_select";
import { networkEventClearSystem, networkEventHandleSystem } from "./systems/network_event";
import { networkSendSystem } from "./systems/network_send";
import { networkedSystem } from "./systems/networked";
import { networkedEntitySystem } from "./systems/networked_entity";
import { perspectiveCameraSystem } from "./systems/perspective_camera";
import { prefabsSystem } from "./systems/prefab";
import { clearRaycastedSystem } from "./systems/raycast";
import { raycasterSystem } from "./systems/raycaster";
import { renderSystem } from "./systems/render";
import { rendererSystem } from "./systems/renderer";
import { sceneSystem } from "./systems/scene";
import { selectedEventClearSystem } from "./systems/selected";
import { streamConnectionSystem } from "./systems/stream_connection";
import { streamRemotePeerRegisterSystem } from "./systems/stream_remote_peers";
import { streamEventClearSystem, streamEventHandleSystem } from "./systems/stream_event";
import { timeSystem } from "./systems/time";
import { clearTransformUpdatedSystem } from "./systems/transform";
import { updateMatricesSystem } from "./systems/update_matrices";
import {
  windowResizeEventHandleSystem,
  windowResizeEventClearSystem
} from "./systems/window_resize_event";
import { addObject3D } from "./utils/entity_object3d";

type RegisteredSystem = {
  system: System;
  orderPriority: number;
};

export class App {
  private systems: RegisteredSystem[];
  private systemParams: SystemParams;
  private serializers: SerializersMap;
  private serializerKeys: SerializerKeyMap;
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
    this.serializers = new Map();
    this.serializerKeys = new Map();
    this.systemParams = {
      serializerKeys: this.serializerKeys,
      serializers: this.serializers
    };
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
    this.registerSystem(windowResizeEventHandleSystem, SystemOrder.EventHandling);
    this.registerSystem(networkEventHandleSystem, SystemOrder.EventHandling);
    this.registerSystem(streamEventHandleSystem, SystemOrder.EventHandling);
    this.registerSystem(streamConnectionSystem, SystemOrder.EventHandling);
    this.registerSystem(streamRemotePeerRegisterSystem, SystemOrder.EventHandling);

    this.registerSystem(mousePositionTrackSystem, SystemOrder.EventHandling + 1);

    this.registerSystem(canvasSystem, SystemOrder.Setup);
    this.registerSystem(prefabsSystem, SystemOrder.Setup);
    this.registerSystem(raycasterSystem, SystemOrder.Setup);
    this.registerSystem(rendererSystem, SystemOrder.Setup);
    this.registerSystem(entityObject3DSystem, SystemOrder.Setup);
    this.registerSystem(sceneSystem, SystemOrder.Setup);
    this.registerSystem(perspectiveCameraSystem, SystemOrder.Setup);
    this.registerSystem(networkedSystem, SystemOrder.Setup);
    this.registerSystem(networkedEntitySystem, SystemOrder.Setup);

    this.registerSystem(linearMoveSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(linearTransformSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(mouseRaycastSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(mouseSelectSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(grabSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(grabbedObjectsMouseTrackSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(avatarKeyControlsSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(avatarMouseControlsSystem, SystemOrder.BeforeMatricesUpdate);

    this.registerSystem(fpsCameraSystem, SystemOrder.MatricesUpdate - 1);
    this.registerSystem(networkSendSystem, SystemOrder.MatricesUpdate - 1);

    this.registerSystem(updateMatricesSystem, SystemOrder.MatricesUpdate);

    this.registerSystem(renderSystem, SystemOrder.Render);

    this.registerSystem(keyEventClearSystem, SystemOrder.TearDown);
    this.registerSystem(mouseMoveEventClearSystem, SystemOrder.TearDown);
    this.registerSystem(mouseButtonEventClearSystem, SystemOrder.TearDown);
    this.registerSystem(selectedEventClearSystem, SystemOrder.TearDown);
    this.registerSystem(micEventClearSystem, SystemOrder.TearDown);
    this.registerSystem(windowResizeEventClearSystem, SystemOrder.TearDown);
    this.registerSystem(networkEventClearSystem, SystemOrder.TearDown);
    this.registerSystem(streamEventClearSystem, SystemOrder.TearDown);
    this.registerSystem(clearRaycastedSystem, SystemOrder.TearDown);
    this.registerSystem(clearTransformUpdatedSystem, SystemOrder.TearDown);

    this.registerSerializers('position', NetworkedPosition, positionSerializers);
    this.registerSerializers('quaternion', NetworkedQuaternion, quaternionSerializers);
    this.registerSerializers('scale', NetworkedScale, scaleSerializers);

    // Entity 0 for null entity
    addEntity(this.world);

    const timeEid = addEntity(this.world);
    addComponent(this.world, Time, timeEid);
    TimeProxy.get(timeEid).allocate(new Clock(), 0, 0);

    const prefabsEid = addEntity(this.world);
    addComponent(this.world, Prefabs, prefabsEid);
    PrefabsProxy.get(prefabsEid).allocate();

    const roomIdEid = addEntity(this.world);
    addComponent(this.world, RoomId, roomIdEid);
    RoomIdProxy.get(roomIdEid).allocate(roomId);

    const userIdEid = addEntity(this.world);
    addComponent(this.world, UserId, userIdEid);
    UserIdProxy.get(userIdEid).allocate(userId);

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

    const mousePositionEid = addEntity(this.world);
    addComponent(this.world, MousePosition, mousePositionEid);
    MousePositionProxy.get(mousePositionEid).allocate();
    addComponent(this.world, PreviousMousePosition, mousePositionEid);
    PreviousMousePositionProxy.get(mousePositionEid).allocate();
    addComponent(this.world, MouseMoveEventListener, mousePositionEid);

    const raycasterEid = addEntity(this.world);
    addComponent(this.world, RaycasterTag, raycasterEid);
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
    addComponent(this.world, SceneTag, sceneEid);

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

    addComponent(this.world, PerspectiveCameraTag, cameraEid);
    PerspectiveCameraProxy.get(cameraEid).allocate(camera);
    addObject3D(this.world, camera, cameraEid);

    addComponent(this.world, FpsCamera, cameraEid);
    addComponent(this.world, InScene, cameraEid);
    addComponent(this.world, SceneCamera, cameraEid);
    addComponent(this.world, WindowSize, cameraEid);
    addComponent(this.world, WindowResizeEventListener, cameraEid);
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

  registerSerializers(key: string, component: Component | null, serializers: Serializers): void {
    if (this.serializers.has(key)) {
      throw new Error(`serializer key ${key} is already used.`);
    }
    if (component !== null) {
      this.serializerKeys.set(component, key);
    }
    this.serializers.set(key, serializers);
  }

  tick() {
    for (const system of this.systems) {
      system.system(this.world, this.systemParams);
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
