import {
  addComponent,
  defineComponent,
  IWorld,
  removeComponent
} from "bitecs";
import { PerspectiveCamera } from "three";
import { NULL_EID } from "../common";

export const SceneCameraInitialize = defineComponent();
export const SceneCamera = defineComponent();
const CameraMap = new Map<number, PerspectiveCamera>();

export class SceneCameraProxy {
  private static instance: SceneCameraProxy = new SceneCameraProxy();
  private eid: number;

  constructor() {
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
