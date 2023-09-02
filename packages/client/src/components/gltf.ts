import { defineComponent } from "bitecs";
import { NULL_EID } from "../common";

export const GltfAssetLoader = defineComponent();

export class GltfAssetLoaderProxy {
  private static instance: GltfAssetLoaderProxy = new GltfAssetLoaderProxy();
  private eid: number;
  private map: Map<number, string /* url */>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): GltfAssetLoaderProxy {
    GltfAssetLoaderProxy.instance.eid = eid;
    return GltfAssetLoaderProxy.instance;
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

export const GltfSceneLoader = defineComponent();

export class GltfSceneLoaderProxy {
  private static instance: GltfSceneLoaderProxy = new GltfSceneLoaderProxy();
  private eid: number;
  private map: Map<number, string /* url */>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): GltfSceneLoaderProxy {
    GltfSceneLoaderProxy.instance.eid = eid;
    return GltfSceneLoaderProxy.instance;
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
