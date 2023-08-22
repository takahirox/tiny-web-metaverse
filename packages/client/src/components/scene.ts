import { defineComponent } from "bitecs";
import { Scene } from "three";
import { NULL_EID } from "../common";

export const SceneTag = defineComponent();
export const InScene = defineComponent();

export class SceneProxy {
  private static instance: SceneProxy = new SceneProxy();
  private eid: number;
  private map: Map<number, Scene>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): SceneProxy {
    SceneProxy.instance.eid = eid;
    return SceneProxy.instance;
  }

  allocate(scene: Scene): void {
    this.map.set(this.eid, scene);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get scene(): Scene {
    return this.map.get(this.eid)!;
  }
}
