import {
  addComponent,
  defineComponent,
  IWorld,
  removeComponent
} from "bitecs";
import { Scene } from "three";
import { NULL_EID } from "../common";

type SceneParams = {
  backgroundColor?: number;
};

export const SceneInitialize = defineComponent();
const SceneInitializeMap = new Map<number, SceneParams>();

export const SceneTag = defineComponent();
const SceneMap = new Map<number, Scene>();

export const InScene = defineComponent();

export class SceneInitializeProxy {
  private static instance: SceneInitializeProxy = new SceneInitializeProxy();
  private eid: number;

  constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): SceneInitializeProxy {
    SceneInitializeProxy.instance.eid = eid;
    return SceneInitializeProxy.instance;
  }

  allocate(world: IWorld, params: SceneParams = {}): void {
    addComponent(world, SceneInitialize, this.eid);
    SceneInitializeMap.set(this.eid, {
      backgroundColor: params.backgroundColor || 0xffffff	
    });
  }

  free(world: IWorld): void {
    removeComponent(world, SceneInitialize, this.eid);
    SceneInitializeMap.delete(this.eid);
  }

  get backgroundColor(): number {
    return SceneInitializeMap.get(this.eid)!.backgroundColor;
  }
}

export class SceneProxy {
  private static instance: SceneProxy = new SceneProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): SceneProxy {
    SceneProxy.instance.eid = eid;
    return SceneProxy.instance;
  }

  allocate(world: IWorld, scene: Scene): void {
    addComponent(world, SceneTag, this.eid);
    SceneMap.set(this.eid, scene);
  }

  free(world: IWorld): void {
    removeComponent(world, SceneTag, this.eid);
    SceneMap.delete(this.eid);
  }

  get scene(): Scene {
    return SceneMap.get(this.eid)!;
  }
}
