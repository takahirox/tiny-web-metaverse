import { defineComponent } from "bitecs";
import { PerspectiveCamera } from "three";
import { NULL_EID } from "../common";

export const PerspectiveCameraTag = defineComponent();

export class PerspectiveCameraProxy {
  private static instance: PerspectiveCameraProxy = new PerspectiveCameraProxy();
  private eid: number;
  private map: Map<number, PerspectiveCamera>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): PerspectiveCameraProxy {
    PerspectiveCameraProxy.instance.eid = eid;
    return PerspectiveCameraProxy.instance;
  }

  allocate(camera: PerspectiveCamera): void {
    this.map.set(this.eid, camera);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get camera(): PerspectiveCamera {
    return this.map.get(this.eid)!;
  }
}

export const SceneCamera = defineComponent();
export const FpsCamera = defineComponent();
