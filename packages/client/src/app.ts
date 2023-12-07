import {
  addComponent,
  addEntity,
  createWorld,
  IWorld
} from "bitecs";
import {
  Color,
  MathUtils,
  PerspectiveCamera,
  Ray,
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
import { Canvas, CanvasProxy } from "./components/canvas";
import {
  FpsCamera,
  PerspectiveCameraComponent,
  PerspectiveCameraProxy,
  SceneCamera
} from "./components/camera";
import {
  CurrentMousePosition,
  MouseMoveEventListener,
  MousePosition,
  MousePositionProxy,
  PreviousMousePosition
} from "./components/mouse";
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
import { NullComponent } from "./components/null";
import { Peers, PeersManager, PeersProxy } from "./components/peer";
import { Pointer, PointerProxy } from "./components/pointer";
import { Prefabs, PrefabsProxy } from "./components/prefab";
import {
  ActiveRay,
  FirstRay,
  RayComponent,
  RayProxy,
  SecondRay
} from "./components/ray";
import { Renderer, RendererProxy } from "./components/renderer";
import { RoomId, RoomIdProxy } from "./components/room_id";
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
import { Timestamp, TimestampProxy } from "./components/timestamp";
import {
  TouchEventListener,
  TouchMoveEventListener,
  TouchPosition,
  TouchPositionProxy
} from "./components/touch";
import { UserId, UserIdProxy } from "./components/user_id";
import {
  FirstXRController,
  SecondXRController,
  WebXRSessionEventListener,
  WebXRSessionManager,
  XRController,
  XRControllerConnectionEventListener,
  XRControllerProxy,
  XRControllerSelectEventListener,
  XRFrameComponent,
  XRFrameProxy,
  XRSessionComponent,
  XRSessionProxy
} from "./components/webxr";
import {
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
import { generateBVHSystem } from "./systems/bvh";
import { canvasSystem } from "./systems/canvas";
import { entityObject3DSystem } from "./systems/entity_object3d";
import { entityRemovalSystem } from "./systems/entity_removal";
import { fpsCameraSystem } from "./systems/fps_camera";
import { gltfSystem } from "./systems/gltf";
import { gltfAssetLoadSystem } from "./systems/gltf_asset_load";
import { gltfSceneLoadSystem } from "./systems/gltf_scene_load";
import { grabSystem } from "./systems/grab";
import { grabbedObjectsRayTrackSystem } from "./systems/grab_ray_track";
import { clearInteractionSystem, interactSystem } from "./systems/interaction";
import {
  keyEventHandleSystem,
  keyEventClearSystem
} from "./systems/keyboard_event";
import { lazilyActivateAnimationSystem } from "./systems/lazily_activate_animation";
import { linearMoveSystem } from "./systems/linear_move";
import { linearTransformSystem } from "./systems/linear_transform";
import { micRequestSystem, micEventClearSystem } from "./systems/media_device";
import {
  clearMessageEventSystem,
  messageEventReceiveSystem,
  messageSendSystem
} from "./systems/message_event";
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
import { mouseInteractionTriggerSystem } from "./systems/mouse_interaction_trigger";
import { networkEventClearSystem, networkEventHandleSystem } from "./systems/network_event";
import { networkSendSystem } from "./systems/network_send";
import { networkedSystem } from "./systems/networked";
import { networkedEntitySystem } from "./systems/networked_entity";
import { peerSystem } from "./systems/peer";
import { perspectiveCameraSystem } from "./systems/perspective_camera";
import { positionalAudioSystem } from "./systems/positional_audio";
import { prefabsSystem } from "./systems/prefab";
import { pointerToRaySystem } from "./systems/ray";
import { clearRaycastedSystem, raycastSystem } from "./systems/raycast";
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
import { touchInteractionTriggerSystem } from "./systems/touch_interaction_trigger";
import {
  touchMoveEventClearSystem,
  touchMoveEventHandleSystem
} from "./systems/touch_move_event";
import { touchPositionToPointerSystem } from "./systems/touch_position_to_pointer";
import { touchPositionTrackSystem } from "./systems/touch_position_track";
import { clearTransformUpdatedSystem } from "./systems/transform";
import { updateMatricesSystem } from "./systems/update_matrices";
import { webxrCameraSystem } from "./systems/webxr_camera";
import {
  clearWebXRControllerEventSystem,
  webxrControllerEventHandlingSystem,
  webxrControllerSystem
} from "./systems/webxr_controller";
import { webxrRaySystem } from "./systems/webxr_ray";
import {
  clearWebXRSessionEventSystem,
  webxrSessionManagementSystem
} from "./systems/webxr_session";
import {
  windowResizeEventHandleSystem,
  windowResizeEventClearSystem
} from "./systems/window_resize_event";

import { getRendererProxy } from "./utils/bitecs_three";
import { addObject3D } from "./utils/entity_object3d";
import { registerSerializers } from "./utils/serializer";
import { getTimestampProxy } from "./utils/timestamp";
import { getXRFrameProxy } from "./utils/webxr";

type RegisteredSystem = {
  system: System;
  orderPriority: number;
};

const createAnonymousName = (): string => {
  return 'Anonymous' + Math.floor(Math.random() * 10000).toString();
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
    userId?: string,
    username?: string
  }) {
    const roomId = params.roomId;
    const userId = params.userId || MathUtils.generateUUID();
    const username = params.username || createAnonymousName();
    const canvas = params.canvas;

    // TODO: Custom server URL support
    this.networkAdapter = new StateAdapter({ roomId, userId, username });
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
    // Any downside from always enabling WebXR?
    renderer.xr.enabled = true;
    // We update it manually
    renderer.xr.cameraAutoUpdate = false;

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
    this.registerSystem(messageEventReceiveSystem, SystemOrder.EventHandling);

    this.registerSystem(peerSystem, SystemOrder.EventHandling + 1);
    this.registerSystem(mousePositionTrackSystem, SystemOrder.EventHandling + 1);
    this.registerSystem(touchPositionTrackSystem, SystemOrder.EventHandling + 1);
    this.registerSystem(webxrSessionManagementSystem, SystemOrder.EventHandling + 1);

    this.registerSystem(mousePositionToPointerSystem, SystemOrder.EventHandling + 2);
    this.registerSystem(touchPositionToPointerSystem, SystemOrder.EventHandling + 2);
    this.registerSystem(webxrCameraSystem, SystemOrder.EventHandling + 2);
    this.registerSystem(webxrControllerEventHandlingSystem, SystemOrder.EventHandling + 2);

    this.registerSystem(webxrRaySystem, SystemOrder.EventHandling + 3);
    this.registerSystem(webxrControllerSystem, SystemOrder.EventHandling + 3);

    this.registerSystem(pointerToRaySystem, SystemOrder.Setup - 1);

    this.registerSystem(canvasSystem, SystemOrder.Setup);
    this.registerSystem(prefabsSystem, SystemOrder.Setup);
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
    this.registerSystem(generateBVHSystem, SystemOrder.Setup + 1);

    this.registerSystem(linearMoveSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(linearTransformSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(raycastSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(mouseInteractionTriggerSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(touchInteractionTriggerSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(interactSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(selectSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(grabSystem, SystemOrder.BeforeMatricesUpdate);
    this.registerSystem(grabbedObjectsRayTrackSystem, SystemOrder.BeforeMatricesUpdate);

    this.registerSystem(fpsCameraSystem, SystemOrder.MatricesUpdate - 1);
    this.registerSystem(networkSendSystem, SystemOrder.MatricesUpdate - 1);

    this.registerSystem(updateMatricesSystem, SystemOrder.MatricesUpdate);

    this.registerSystem(positionalAudioSystem, SystemOrder.MatricesUpdate + 1);

    this.registerSystem(renderSystem, SystemOrder.Render);

    this.registerSystem(messageSendSystem, SystemOrder.TearDown - 1);

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
    this.registerSystem(clearMessageEventSystem, SystemOrder.TearDown);
    this.registerSystem(clearWebXRControllerEventSystem, SystemOrder.TearDown);
    this.registerSystem(clearWebXRSessionEventSystem, SystemOrder.TearDown);

    this.registerSystem(entityRemovalSystem, SystemOrder.TearDown + 10);

    // Entity 0 for null entity
    const nullEid = addEntity(this.world);
    addComponent(this.world, NullComponent, nullEid);

    const timestampEid = addEntity(this.world);
    addComponent(this.world, Timestamp, timestampEid);
    TimestampProxy.get(timestampEid).allocate();

    const timeEid = addEntity(this.world);
    addComponent(this.world, Time, timeEid);
    TimeProxy.get(timeEid).allocate();

    const xrFrameEid = addEntity(this.world);
    addComponent(this.world, XRFrameComponent, xrFrameEid);
    XRFrameProxy.get(xrFrameEid).allocate();

    const xrSessionEid = addEntity(this.world);
    addComponent(this.world, XRSessionComponent, xrSessionEid);
    XRSessionProxy.get(xrSessionEid).allocate();

    const webxrSessionManagerEid = addEntity(this.world);
    addComponent(this.world, WebXRSessionManager, webxrSessionManagerEid);
    addComponent(this.world, WebXRSessionEventListener, webxrSessionManagerEid);

    // Should we get controller and create entity when entering immersive mode?
    const xrController1 = renderer.xr.getController(0);
    const xrController1Eid = addEntity(this.world);
    addComponent(this.world, XRController, xrController1Eid);
    XRControllerProxy.get(xrController1Eid).allocate(xrController1);
    addComponent(this.world, FirstXRController, xrController1Eid);
    addObject3D(this.world, xrController1, xrController1Eid);
    addComponent(this.world, XRControllerConnectionEventListener, xrController1Eid);
    addComponent(this.world, XRControllerSelectEventListener, xrController1Eid);

    const xrController2 = renderer.xr.getController(1);
    const xrController2Eid = addEntity(this.world);
    addComponent(this.world, XRController, xrController2Eid);
    XRControllerProxy.get(xrController2Eid).allocate(xrController2);
    addComponent(this.world, SecondXRController, xrController2Eid);
    addObject3D(this.world, xrController2, xrController2Eid);
    addComponent(this.world, XRControllerConnectionEventListener, xrController2Eid);
    addComponent(this.world, XRControllerSelectEventListener, xrController2Eid);

    const audioContext = new AudioContext();
    const audioContextEid = addEntity(this.world);
    addComponent(this.world, AudioContextComponent, audioContextEid);
    AudioContextProxy.get(audioContextEid).allocate(audioContext);

    if (audioContext.state === 'suspended') {
      addComponent(this.world, AudioContextSuspended, audioContextEid);
    }

    const peersEid = addEntity(this.world);
    addComponent(this.world, Peers, peersEid);
    PeersProxy.get(peersEid).allocate();

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

    const peerManagerEid = addEntity(this.world);
    addComponent(this.world, PeersManager, peerManagerEid);
    addComponent(this.world, UserNetworkEventListener, peerManagerEid);

    const firstRayEid = addEntity(this.world);
    addComponent(this.world, RayComponent, firstRayEid);
    RayProxy.get(firstRayEid).allocate(new Ray());
    addComponent(this.world, FirstRay, firstRayEid);
    addComponent(this.world, ActiveRay, firstRayEid);
    addComponent(this.world, WebXRSessionEventListener, firstRayEid);
    addComponent(this.world, XRControllerConnectionEventListener, firstRayEid);

    // The second ray can be activated in VR/AR mode
    const secondRayEid = addEntity(this.world);
    addComponent(this.world, RayComponent, secondRayEid);
    RayProxy.get(secondRayEid).allocate(new Ray());
    addComponent(this.world, SecondRay, secondRayEid);
    addComponent(this.world, WebXRSessionEventListener, secondRayEid);
    addComponent(this.world, XRControllerConnectionEventListener, secondRayEid);

    const pointerEid = addEntity(this.world);
    addComponent(this.world, Pointer, pointerEid);
    PointerProxy.get(pointerEid).allocate();

    const currentMousePositionEid = addEntity(this.world);
    addComponent(this.world, MousePosition, currentMousePositionEid);
    MousePositionProxy.get(currentMousePositionEid).allocate();
    addComponent(this.world, CurrentMousePosition, currentMousePositionEid);
    addComponent(this.world, MouseMoveEventListener, currentMousePositionEid);

    const previousMousePositionEid = addEntity(this.world);
    addComponent(this.world, MousePosition, previousMousePositionEid);
    MousePositionProxy.get(previousMousePositionEid).allocate();
    addComponent(this.world, PreviousMousePosition, previousMousePositionEid);

    const touchPositionEid = addEntity(this.world);
    addComponent(this.world, TouchPosition, touchPositionEid);
    TouchPositionProxy.get(touchPositionEid).allocate();
    addComponent(this.world, TouchEventListener, touchPositionEid);
    addComponent(this.world, TouchMoveEventListener, touchPositionEid);

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

    // Matrices are updated in updateMatricesSystem.
    camera.matrixWorldAutoUpdate = false;

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

  tick(): void {
    // TODO: Add try-catch to prevent crash?
    for (const system of this.systems) {
      system.system(this.world);
    }
  }

  start(): void {
    getRendererProxy(this.world).renderer.setAnimationLoop((timestamp, xrFrame) => {
      // For systems that want to use requestAnimationFrame timestamp
      // instead of performance.now() timestamp
      getTimestampProxy(this.world).timestamp = timestamp;

      const xrFrameProxy = getXRFrameProxy(this.world);

      if (xrFrame !== undefined) {
        xrFrameProxy.frame = xrFrame;
      }

      this.tick();

      xrFrameProxy.frame = null;
    });
  }

  stop(): void {
    throw new Error('stop() is unimplemented.');
  }

  getWorld(): IWorld {
    return this.world;
  }
}
