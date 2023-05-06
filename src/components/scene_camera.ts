import {
  addComponent,
  defineComponent,
  IWorld,
  removeComponent
} from "bitecs";
import { PerspectiveCamera } from "three";
import { NULL_EID } from "../common";

export type SceneCameraParams = {
  fov?: number,
  aspect?: number,
  near?: number,
  far?: number
};

export const SceneCameraInit = defineComponent();
const CameraInitMap = new Map<number, SceneCameraParams>();

export const SceneCamera = defineComponent();
const CameraMap = new Map<number, PerspectiveCamera>();

export class SceneCameraInitProxy {
  private static instance: SceneCameraInitProxy = new SceneCameraInitProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): SceneCameraInitProxy {
    SceneCameraInitProxy.instance.eid = eid;
    return SceneCameraInitProxy.instance;
  }

  allocate(world: IWorld, params: SceneCameraParams = {}): void {
    addComponent(world, SceneCameraInit, this.eid);
    CameraInitMap.set(this.eid, {
      fov: params.fov || 60,
      aspect: params.aspect || (window.innerWidth / window.innerHeight),
      near: params.near || 0.001,
      far: params.far || 2000.0
    });
  }

  free(world: IWorld): void {
    removeComponent(world, SceneCameraInit, this.eid);
    CameraInitMap.delete(this.eid);
  }

  get fov(): number {
    return CameraInitMap.get(this.eid)!.fov;
  }

  get aspect(): number {
    return CameraInitMap.get(this.eid)!.aspect;
  }

  get near(): number {
    return CameraInitMap.get(this.eid)!.near;
  }

  get far(): number {
    return CameraInitMap.get(this.eid)!.far;
  }
}

export class SceneCameraProxy {
  private static instance: SceneCameraProxy = new SceneCameraProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): SceneCameraProxy {
    SceneCameraProxy.instance.eid = eid;
    return SceneCameraProxy.instance;
  }

  allocate(world: IWorld, camera: PerspectiveCamera): void {
    addComponent(world, SceneCamera, this.eid);
    CameraMap.set(this.eid, camera);
  }

  free(world: IWorld): void {
    removeComponent(world, SceneCamera, this.eid);
    CameraMap.delete(this.eid);
  }

  get camera(): PerspectiveCamera {
    return CameraMap.get(this.eid)!;
  }
}
