import {
  addComponent,
  defineComponent,
  IWorld,
  removeComponent
} from "bitecs";
import { PerspectiveCamera } from "three";
import { NULL_EID } from "../common";

export type PerspectiveCameraParams = {
  fov?: number,
  aspect?: number,
  near?: number,
  far?: number
};

export const PerspectiveCameraInit = defineComponent();
const PerspectiveCameraInitMap = new Map<number, PerspectiveCameraParams>();
export const PerspectiveCameraDestroy = defineComponent();

export const PerspectiveCameraTag = defineComponent();
const PerspectiveCameraMap = new Map<number, PerspectiveCamera>();

export const SceneCamera = defineComponent();
export const FpsCamera = defineComponent();

export class PerspectiveCameraInitProxy {
  private static instance: PerspectiveCameraInitProxy = new PerspectiveCameraInitProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): PerspectiveCameraInitProxy {
    PerspectiveCameraInitProxy.instance.eid = eid;
    return PerspectiveCameraInitProxy.instance;
  }

  allocate(world: IWorld, params: PerspectiveCameraParams = {}): void {
    addComponent(world, PerspectiveCameraInit, this.eid);
    PerspectiveCameraInitMap.set(this.eid, {
      fov: params.fov || 60,
      aspect: params.aspect || (window.innerWidth / window.innerHeight),
      near: params.near || 0.001,
      far: params.far || 2000.0
    });
  }

  free(world: IWorld): void {
    removeComponent(world, PerspectiveCameraInit, this.eid);
    PerspectiveCameraInitMap.delete(this.eid);
  }

  get fov(): number {
    return PerspectiveCameraInitMap.get(this.eid)!.fov;
  }

  get aspect(): number {
    return PerspectiveCameraInitMap.get(this.eid)!.aspect;
  }

  get near(): number {
    return PerspectiveCameraInitMap.get(this.eid)!.near;
  }

  get far(): number {
    return PerspectiveCameraInitMap.get(this.eid)!.far;
  }
}

export class PerspectiveCameraProxy {
  private static instance: PerspectiveCameraProxy = new PerspectiveCameraProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): PerspectiveCameraProxy {
    PerspectiveCameraProxy.instance.eid = eid;
    return PerspectiveCameraProxy.instance;
  }

  allocate(world: IWorld, camera: PerspectiveCamera): void {
    addComponent(world, PerspectiveCameraTag, this.eid);
    PerspectiveCameraMap.set(this.eid, camera);
  }

  free(world: IWorld): void {
    removeComponent(world, PerspectiveCameraTag, this.eid);
    PerspectiveCameraMap.delete(this.eid);
  }

  get camera(): PerspectiveCamera {
    return PerspectiveCameraMap.get(this.eid)!;
  }
}
