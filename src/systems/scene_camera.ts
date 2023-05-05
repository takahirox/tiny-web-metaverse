import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld,
  removeComponent
} from "bitecs";
import { PerspectiveCamera } from "three";
import { EntityObject3DProxy } from "../components/entity_object3d";
import {
  SceneCameraInitialize,
  SceneCameraInitializeProxy,
  SceneCameraProxy,
  SceneCamera
} from "../components/scene_camera";
import { WindowResizeEvent, WindowSize } from "../components/window_resize";

const initializeEnterQuery = enterQuery(defineQuery([SceneCameraInitialize]));
const sceneCameraExitQuery = exitQuery(defineQuery([SceneCamera]));
const sceneCameraWindowResizeEnterQuery =
  enterQuery(defineQuery([SceneCamera, WindowResizeEvent, WindowSize]));

export const sceneCameraSystem = (world: IWorld): void => {
  initializeEnterQuery(world).forEach(eid => {
    const proxy = SceneCameraInitializeProxy.get(eid);
    const fov = proxy.fov;
    const aspect = proxy.aspect;
    const near = proxy.near;
    const far = proxy.far;
    proxy.free(world);

    const camera = new PerspectiveCamera(fov, aspect, near, far);
    EntityObject3DProxy.get(eid).addObject3D(world, camera);
    SceneCameraProxy.get(eid).allocate(world, camera);
  });

  sceneCameraExitQuery(world).forEach(eid => {
    const proxy = SceneCameraProxy.get(eid);
    const camera = proxy.camera;
    EntityObject3DProxy.get(eid).removeObject3D(world, camera);
    proxy.free(world);
  });

  sceneCameraWindowResizeEnterQuery(world).forEach(eid => {
    const camera = SceneCameraProxy.get(eid).camera;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    removeComponent(world, WindowResizeEvent, eid);
  });
};
