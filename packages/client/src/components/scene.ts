import { defineComponent } from "bitecs";
import { Scene, Texture } from "three";
import { NULL_EID } from "../common";

export const SceneComponent = defineComponent();
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

export const SceneEnvironmentMap = defineComponent();

export class SceneEnvironmentMapProxy {
  private static instance: SceneEnvironmentMapProxy = new SceneEnvironmentMapProxy();
  private eid: number;
  private map: Map<number, Texture>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): SceneEnvironmentMapProxy {
    SceneEnvironmentMapProxy.instance.eid = eid;
    return SceneEnvironmentMapProxy.instance;
  }

  allocate(texture: Texture): void {
    this.map.set(this.eid, texture);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get texture(): Texture {
    return this.map.get(this.eid)!;
  }
}

export const SceneEnvironmentMapLoader = defineComponent();

export class SceneEnvironmentMapLoaderProxy {
  private static instance: SceneEnvironmentMapLoaderProxy = new SceneEnvironmentMapLoaderProxy();
  private eid: number;
  private map: Map<number, string /* url */>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): SceneEnvironmentMapLoaderProxy {
    SceneEnvironmentMapLoaderProxy.instance.eid = eid;
    return SceneEnvironmentMapLoaderProxy.instance;
  }

  allocate(url: string): void {
    this.map.set(this.eid, url);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get url(): string {
    return this.map.get(this.eid)!;
  }
}
