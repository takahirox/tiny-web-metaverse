import {
  addComponent,
  addEntity,
  Component,
  createWorld,
  IWorld
} from "bitecs";
import { MathUtils, Raycaster } from "three";
import { Adapter as PhoenixAdapter } from "@tiny-web-metaverse/state_client";
import {
  Prefab,
  PrefabMap,
  SerializerKeyMap,
  SerializersMap,
  Serializers,
  System,
  SystemParams,
  SystemOrder
} from "./common";
import { AvatarMouseControlsProxy } from "./components/avatar_mouse_controls";
import { EntityObject3DProxy } from "./components/entity_object3d";
import {
  MouseButtonEventHandlerInitProxy,
  MouseButtonEventListener,
  MouseMoveEventHandlerInitProxy,
  MouseMoveEventListener,
  MousePositionProxy,
  PreviousMousePositionProxy
} from "./components/mouse";
import { KeyEventHandlerInit } from "./components/keyboard";
import {
  ComponentNetworkEventListener,
  EntityNetworkEventListener,
  NetworkAdapterProxy,
  NetworkedEntityManagerProxy,
  NetworkedPosition,
  NetworkedQuaternion,
  NetworkedScale,
  NetworkEventReceiverInit,
  NetworkEventSenderProxy,
  UserNetworkEventListener
} from "./components/network";
import { RendererInitProxy } from "./components/renderer";
import { InScene, SceneInitProxy } from "./components/scene";
import {
  FpsCamera,
  PerspectiveCameraInitProxy,
  SceneCamera
} from "./components/camera";
import { RaycasterProxy } from "./components/raycast";
import { TimeInit } from "./components/time";
import {
  WindowResizeEventHandlerInit,
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
import { fpsCameraSystem } from "./systems/fps_camera";
import { grabSystem } from "./systems/grab";
import { grabbedObjectsMouseTrackSystem } from "./systems/grab_mouse_track";
import {
  keyEventHandleSystem,
  keyEventClearSystem
} from "./systems/keyboard_event";
import { linearMoveSystem } from "./systems/linear_move";
import { linearTransformSystem } from "./systems/linear_transform";
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
import { clearRaycastedSystem } from "./systems/raycast";
import { renderSystem } from "./systems/render";
import { rendererSystem } from "./systems/renderer";
import { sceneSystem } from "./systems/scene";
import { timeSystem } from "./systems/time";
import { clearTransformUpdatedSystem } from "./systems/transform";
import { updateMatricesSystem } from "./systems/update_matrices";
import {
  windowResizeEventHandleSystem,
  windowResizeEventClearSystem
} from "./systems/window_resize_event";

type RegisteredSystem = {
  system: System;
  orderPriority: number;
};

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  return canvas;
};

export class App {
  private systems: RegisteredSystem[];
  private systemParams: SystemParams;
  private prefabs: PrefabMap;
  private serializers: SerializersMap;
  private serializerKeys: SerializerKeyMap;
  private canvas: HTMLCanvasElement;
  private world: IWorld;
  private adapter: PhoenixAdapter;
  readonly userId: string;

  constructor(params: {
    canvas?: HTMLCanvasElement,
    userId?: string
  } = {}) {
    const canvas = params.canvas || createCanvas();
    const userId = params.userId || MathUtils.generateUUID();

    this.canvas = canvas;
    this.systems = [];
    this.prefabs = new Map();
    this.serializers = new Map();
    this.serializerKeys = new Map();
    this.systemParams = {
      prefabs: this.prefabs,
      serializerKeys: this.serializerKeys,
      serializers: this.serializers
    };
    this.world = createWorld();
    this.adapter = new PhoenixAdapter({userId});
    this.init();
  }

  private init(): void {
    // Built-in systems and entities

    this.registerSystem(timeSystem, SystemOrder.Time);

    this.registerSystem(keyEventHandleSystem, SystemOrder.EventHandling);
    this.registerSystem(mouseMoveEventHandleSystem, SystemOrder.EventHandling);
    this.registerSystem(mouseButtonEventHandleSystem, SystemOrder.EventHandling);
    this.registerSystem(windowResizeEventHandleSystem, SystemOrder.EventHandling);
    this.registerSystem(networkEventHandleSystem, SystemOrder.EventHandling);

    this.registerSystem(mousePositionTrackSystem, SystemOrder.EventHandling + 1);

    this.registerSystem(rendererSystem, SystemOrder.Setup);
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
    this.registerSystem(windowResizeEventClearSystem, SystemOrder.TearDown);
    this.registerSystem(networkEventClearSystem, SystemOrder.TearDown);
    this.registerSystem(clearRaycastedSystem, SystemOrder.TearDown);
    this.registerSystem(clearTransformUpdatedSystem, SystemOrder.TearDown);

    this.registerSerializers('position', NetworkedPosition, positionSerializers);
    this.registerSerializers('quaternion', NetworkedQuaternion, quaternionSerializers);
    this.registerSerializers('scale', NetworkedScale, scaleSerializers);

    // Entity 0 for null entity
    addEntity(this.world);

    const timeEid = addEntity(this.world);
    addComponent(this.world, TimeInit, timeEid);

    const keyEventHandlerEid = addEntity(this.world);
    addComponent(this.world, KeyEventHandlerInit, keyEventHandlerEid);

    const mouseMoveEventHandlerEid = addEntity(this.world);
    MouseMoveEventHandlerInitProxy.get(mouseMoveEventHandlerEid).allocate(this.world, this.canvas);

    const mouseButtonEventHandlerEid = addEntity(this.world);
    MouseButtonEventHandlerInitProxy.get(mouseButtonEventHandlerEid).allocate(this.world, this.canvas);

    const resizeEventHandlerEid = addEntity(this.world);
    addComponent(this.world, WindowResizeEventHandlerInit, resizeEventHandlerEid);

    const adapterEid = addEntity(this.world);
    NetworkAdapterProxy.get(adapterEid).allocate(this.world, this.adapter);

    const networkEventReceiverEid = addEntity(this.world);
    addComponent(this.world, NetworkEventReceiverInit, networkEventReceiverEid);

    const networkEventSenderEid = addEntity(this.world);
    NetworkEventSenderProxy.get(networkEventSenderEid).allocate(this.world);

    const networkedEntityManagerEid = addEntity(this.world);
    NetworkedEntityManagerProxy.get(networkedEntityManagerEid).allocate(this.world);
    addComponent(this.world, ComponentNetworkEventListener, networkedEntityManagerEid);
    addComponent(this.world, EntityNetworkEventListener, networkedEntityManagerEid);
    addComponent(this.world, UserNetworkEventListener, networkedEntityManagerEid);

    const mousePositionEid = addEntity(this.world);
    MousePositionProxy.get(mousePositionEid).allocate(this.world);
    PreviousMousePositionProxy.get(mousePositionEid).allocate(this.world);
    addComponent(this.world, MouseMoveEventListener, mousePositionEid);

    const raycasterEid = addEntity(this.world);
    RaycasterProxy.get(raycasterEid).allocate(this.world, new Raycaster());

    const avatarMouseControlsEid = addEntity(this.world);
    AvatarMouseControlsProxy.get(avatarMouseControlsEid).allocate(this.world);
    addComponent(this.world, MouseButtonEventListener, avatarMouseControlsEid);

    const rendererEid = addEntity(this.world);
    RendererInitProxy.get(rendererEid).allocate(this.world, {canvas: this.canvas});
    addComponent(this.world, WindowSize, rendererEid);
    addComponent(this.world, WindowResizeEventListener, rendererEid);

    const sceneEid = addEntity(this.world);
    SceneInitProxy.get(sceneEid).allocate(this.world);

    const cameraEid = addEntity(this.world);
    PerspectiveCameraInitProxy.get(cameraEid).allocate(this.world);
    addComponent(this.world, FpsCamera, cameraEid);
    addComponent(this.world, InScene, cameraEid);
    addComponent(this.world, SceneCamera, cameraEid);
    addComponent(this.world, WindowSize, cameraEid);
    addComponent(this.world, WindowResizeEventListener, cameraEid);
    EntityObject3DProxy.get(cameraEid).allocate(this.world);
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

  registerPrefab(key: string, prefab: Prefab): void {
    if (this.prefabs.has(key)) {
      throw new Error(`prefab key ${key} is already used.`);
    }
    this.prefabs.set(key, prefab);
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

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getWorld(): IWorld {
    return this.world;
  }
}
