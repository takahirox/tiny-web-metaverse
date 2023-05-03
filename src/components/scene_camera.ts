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

class SceneCameraProxy {
  eid: number;

  constructor(eid: number) {
    this.eid = eid;
  }

  add(world: IWorld, camera: PerspectiveCamera): void {
    addComponent(world, SceneCamera, this.eid);
    CameraMap.set(this.eid, camera);
  }

  remove(world: IWorld): void {
    removeComponent(world, SceneCamera, this.eid);
    CameraMap.delete(this.eid);
  }

  get camera(): PerspectiveCamera {
    return CameraMap.get(this.eid)!;
  }
}

export const sceneCameraProxy = new SceneCameraProxy(NULL_EID);
