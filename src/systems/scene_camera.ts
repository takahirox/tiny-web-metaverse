import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld
} from "bitecs";
import { PerspectiveCamera } from "three";
import { EntityRootObject3DProxy } from "../components/entity_root_object3d";
import {
  SceneCameraInitialize,
  SceneCameraInitializeProxy,
  SceneCameraProxy,
  SceneCamera
} from "../components/scene_camera";

const initializeQuery = defineQuery([SceneCameraInitialize]);
const initializeEnterQuery = enterQuery(initializeQuery);

const sceneCameraQuery = defineQuery([SceneCamera]);
const sceneCameraExitQuery = exitQuery(sceneCameraQuery);

export const sceneCameraSystem = (world: IWorld): void => {
  initializeEnterQuery(world).forEach(eid => {
    const proxy = SceneCameraInitializeProxy.get(eid);
    const fov = proxy.fov;
    const aspect = proxy.aspect;
    const near = proxy.near;
    const far = proxy.far;
    proxy.free(world);

    const camera = new PerspectiveCamera(fov, aspect, near, far);
    EntityRootObject3DProxy.get(eid).addObject3D(world, camera);
    SceneCameraProxy.get(eid).allocate(world, camera);
  });

  sceneCameraExitQuery(world).forEach(eid => {
    const proxy = SceneCameraProxy.get(eid);
    const camera = proxy.camera;
    EntityRootObject3DProxy.get(eid).removeObject3D(world, camera);
    proxy.free(world);
  });
};
