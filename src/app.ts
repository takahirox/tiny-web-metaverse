import {
  addComponent,
  addEntity,
  createWorld,
  IWorld
} from "bitecs";
import { TimeInitialize } from "./components/time";
import { timeSystem } from "./systems/time";
import { RendererInitializeProxy } from "./components/renderer";
import { rendererSystem } from "./systems/renderer";
import { InScene, SceneInitializeProxy } from "./components/scene";
import { sceneSystem } from "./systems/scene";
import { SceneCameraInitializeProxy } from "./components/scene_camera";
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

type System = (world: IWorld) => void;

export class App {
  private systems: System[];
  private world: IWorld;

  constructor() {
    this.systems = [];
    this.world = createWorld();
    this.init();
  }

  private init(): void {
    // Event Listeners

    listenWindowResizeEvent(this.world);

    // Built-in systems and entities

    this.registerSystem(timeSystem, SystemOrder.Time);

    this.registerSystem(rendererSystem, SystemOrder.Setup);
    this.registerSystem(sceneSystem, SystemOrder.Setup);
    this.registerSystem(sceneCameraSystem, SystemOrder.Setup);

    this.registerSystem(updateMatricesSystem, SystemOrder.MatricesUpdate);

    this.registerSystem(renderSystem, SystemOrder.Render);

    this.registerSystem(windowResizeEventClearSystem, SystemOrder.TearDown);

    // Entity 0 for null entity
    addEntity(this.world);

    const timeEid = addEntity(this.world);
    addComponent(this.world, TimeInitialize, timeEid);

    const rendererEid = addEntity(this.world);
    RendererInitializeProxy.get(rendererEid).allocate(this.world);
    addComponent(this.world, WindowSize, rendererEid);
    addComponent(this.world, WindowResizeEventListener, rendererEid);

    const sceneEid = addEntity(this.world);
    SceneInitializeProxy.get(sceneEid).allocate(this.world);

    const cameraEid = addEntity(this.world);
    SceneCameraInitializeProxy.get(cameraEid).allocate(this.world);
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
    _priorityOrder: number = SystemOrder.BeforeMatricesUpdate
  ): void {
    // TODO: Take into priority order account
    this.systems.push(system);
  }

  deregisterSystem(_system: System): void {
    // TODO: Implement
  }

  tick() {
    for (const system of this.systems) {
      system(this.world);
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
