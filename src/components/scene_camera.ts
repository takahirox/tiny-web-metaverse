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

export const SceneCameraInitialize = defineComponent();
const CameraInitializeMap = new Map<number, SceneCameraParams>();

export const SceneCamera = defineComponent();
const CameraMap = new Map<number, PerspectiveCamera>();

export class SceneCameraInitializeProxy {
  private static instance: SceneCameraInitializeProxy = new SceneCameraInitializeProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): SceneCameraInitializeProxy {
    SceneCameraInitializeProxy.instance.eid = eid;
    return SceneCameraInitializeProxy.instance;
  }

  allocate(world: IWorld, params: SceneCameraParams = {}): void {
    addComponent(world, SceneCameraInitialize, this.eid);
    CameraInitializeMap.set(this.eid, {
      fov: params.fov || 60,
      aspect: params.aspect || (window.innerWidth / window.innerHeight),
      near: params.near || 0.001,
      far: params.far || 2000.0
    });
  }

  free(world: IWorld): void {
    removeComponent(world, SceneCameraInitialize, this.eid);
    CameraInitializeMap.delete(this.eid);
  }

  get fov(): number {
    return CameraInitializeMap.get(this.eid)!.fov;
  }

  get aspect(): number {
    return CameraInitializeMap.get(this.eid)!.aspect;
  }

  get near(): number {
    return CameraInitializeMap.get(this.eid)!.near;
  }

  get far(): number {
    return CameraInitializeMap.get(this.eid)!.far;
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
