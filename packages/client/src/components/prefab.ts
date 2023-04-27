import { defineComponent } from "bitecs";
import { NULL_EID, Prefab } from "../common";

export const Prefabs = defineComponent();

export class PrefabsProxy {
  private static instance: PrefabsProxy = new PrefabsProxy();
  private eid: number;
  private map: Map<number, Map<string, Prefab>>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): PrefabsProxy {
    PrefabsProxy.instance.eid = eid;
    return PrefabsProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, new Map());
  }

  free(): void {
    this.map.delete(this.eid);
  }

  register(key: string, prefab: Prefab): void {
    this.map.get(this.eid)!.set(key, prefab);
  }

  deregister(key: string): void {
    this.map.get(this.eid)!.delete(key);
  }

  get(key: string): Prefab {
    return this.map.get(this.eid)!.get(key)!;
  }
}
