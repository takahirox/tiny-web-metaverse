import {
  addComponent,
  addEntity,
  createWorld,
  IWorld
} from "bitecs";
import { TimeInit } from "./components/time";
import { timeSystem } from "./systems/time";
import { RendererInitProxy } from "./components/renderer";
import { rendererSystem } from "./systems/renderer";
import { InScene, SceneInitProxy } from "./components/scene";
import { sceneSystem } from "./systems/scene";
import { SceneCameraInitProxy } from "./components/scene_camera";
import { sceneCameraSystem } from "./systems/scene_camera";
import { updateMatricesSystem } from "./systems/update_matrices";
import { renderSystem } from "./systems/render";
import { SystemOrder } from "./common";
import { EntityObject3DProxy } from "./components/entity_object3d";
import {
  WindowResizeEventListener,
  WindowSize
} from "./components/window_resize";
import {
  listenWindowResizeEvent,
  windowResizeEventClearSystem
} from "./events/window_resize";
import {
  listenMouseButtonEvents,
  mouseButtonEventClearSystem
} from "./events/mouse";
import {
  listenKeyEvents,
  keyEventClearSystem
} from "./events/keyboard";

type System = (world: IWorld) => void;

type RegisteredSystem = {
  system: System;
  orderPriority: number;
};

export class App {
  private systems: RegisteredSystem[];
  private world: IWorld;

  constructor() {
    this.systems = [];
    this.world = createWorld();
    this.init();
  }

  private init(): void {
    // Event Listeners

    listenKeyEvents(this.world);
    listenMouseButtonEvents(this.world);
    listenWindowResizeEvent(this.world);

    // Built-in systems and entities

    this.registerSystem(timeSystem, SystemOrder.Time);

    this.registerSystem(rendererSystem, SystemOrder.Setup);
    this.registerSystem(sceneSystem, SystemOrder.Setup);
    this.registerSystem(sceneCameraSystem, SystemOrder.Setup);

    this.registerSystem(updateMatricesSystem, SystemOrder.MatricesUpdate);

    this.registerSystem(renderSystem, SystemOrder.Render);

    this.registerSystem(keyEventClearSystem, SystemOrder.TearDown);
    this.registerSystem(mouseButtonEventClearSystem, SystemOrder.TearDown);
    this.registerSystem(windowResizeEventClearSystem, SystemOrder.TearDown);

    // Entity 0 for null entity
    addEntity(this.world);

    const timeEid = addEntity(this.world);
    addComponent(this.world, TimeInit, timeEid);

    const rendererEid = addEntity(this.world);
    RendererInitProxy.get(rendererEid).allocate(this.world);
    addComponent(this.world, WindowSize, rendererEid);
    addComponent(this.world, WindowResizeEventListener, rendererEid);

    const sceneEid = addEntity(this.world);
    SceneInitProxy.get(sceneEid).allocate(this.world);

    const cameraEid = addEntity(this.world);
    SceneCameraInitProxy.get(cameraEid).allocate(this.world);
    addComponent(this.world, WindowSize, cameraEid);
    addComponent(this.world, WindowResizeEventListener, cameraEid);
    addComponent(this.world, InScene, cameraEid);

    const proxy = EntityObject3DProxy.get(cameraEid);
    proxy.allocate(this.world);
    // TODO: Fix me
    proxy.root.position.set(0.0, 0.0, 5.0);
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
