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

class SceneInitializeProxy {
  eid: number;

  constructor(eid: number) {
    this.eid = eid;
  }

  add(world: IWorld, params: SceneParams = {}): void {
    addComponent(world, SceneInitialize, this.eid);
    SceneInitializeMap.set(this.eid, {
      backgroundColor: params.backgroundColor || 0xffffff	
    });
  }

  remove(world: IWorld): void {
    removeComponent(world, SceneInitialize, this.eid);
    SceneInitializeMap.delete(this.eid);
  }

  get backgroundColor(): number {
    return SceneInitializeMap.get(this.eid)!.backgroundColor;
  }
}

class SceneProxy {
  eid: number;

  constructor(eid: number) {
    this.eid = eid;
  }

  add(world: IWorld, scene: Scene): void {
    addComponent(world, SceneTag, this.eid);
    SceneMap.set(this.eid, scene);
  }

  remove(world: IWorld): void {
    removeComponent(world, SceneTag, this.eid);
    SceneMap.delete(this.eid);
  }

  get scene(): Scene {
    return SceneMap.get(this.eid)!;
  }
}

export const sceneInitializeProxy = new SceneInitializeProxy(NULL_EID);
export const sceneProxy = new SceneProxy(NULL_EID);
