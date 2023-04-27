import { defineComponent } from "bitecs";
import { type AnimationMixer, type Group } from "three";
import { NULL_EID } from "@tiny-web-metaverse/client/src";

export const LoadingObject = defineComponent();

export class LoadingObjectProxy {
  private static instance: LoadingObjectProxy = new LoadingObjectProxy();
  private eid: number;
  private map: Map<number, { group: Group, mixer: AnimationMixer }>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): LoadingObjectProxy {
    LoadingObjectProxy.instance.eid = eid;
    return LoadingObjectProxy.instance;
  }

  allocate(group: Group, mixer: AnimationMixer): void {
    this.map.set(this.eid, { group, mixer });
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get group(): Group {
    return this.map.get(this.eid)!.group;
  }

  get mixer(): AnimationMixer {
    return this.map.get(this.eid)!.mixer;
  }
}

export const LoadingObjectLoader = defineComponent();
