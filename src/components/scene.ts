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

export const SceneInit = defineComponent();
const SceneInitMap = new Map<number, SceneParams>();

export const SceneTag = defineComponent();
const SceneMap = new Map<number, Scene>();

export const InScene = defineComponent();

export class SceneInitProxy {
  private static instance: SceneInitProxy = new SceneInitProxy();
  private eid: number;

  constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): SceneInitProxy {
    SceneInitProxy.instance.eid = eid;
    return SceneInitProxy.instance;
  }

  allocate(world: IWorld, params: SceneParams = {}): void {
    addComponent(world, SceneInit, this.eid);
    SceneInitMap.set(this.eid, {
      backgroundColor: params.backgroundColor || 0xffffff	
    });
  }

  free(world: IWorld): void {
    removeComponent(world, SceneInit, this.eid);
    SceneInitMap.delete(this.eid);
  }

  get backgroundColor(): number {
    return SceneInitMap.get(this.eid)!.backgroundColor;
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
