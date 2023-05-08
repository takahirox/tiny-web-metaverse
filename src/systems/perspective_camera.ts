import {
  defineQuery,
  enterQuery,
  IWorld,
  removeComponent
} from "bitecs";
import { PerspectiveCamera } from "three";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";
import {
  PerspectiveCameraDestroy,
  PerspectiveCameraInit,
  PerspectiveCameraInitProxy,
  PerspectiveCameraProxy,
  PerspectiveCameraTag
} from "../components/camera";
import { WindowResizeEvent, WindowSize } from "../components/window_resize";

const initEnterQuery = enterQuery(defineQuery([PerspectiveCameraInit]));
const destroyEnterQuery = enterQuery(defineQuery(
  [EntityObject3D, PerspectiveCameraDestroy, PerspectiveCameraTag]));
const cameraWindowResizeEnterQuery =
  enterQuery(defineQuery([PerspectiveCameraTag, WindowResizeEvent, WindowSize]));

export const perspectiveCameraSystem = (world: IWorld): void => {
  destroyEnterQuery(world).forEach(eid => {
    removeComponent(world, PerspectiveCameraDestroy, eid);

    const proxy = PerspectiveCameraProxy.get(eid);
    const camera = proxy.camera;
    EntityObject3DProxy.get(eid).removeObject3D(world, camera);
    proxy.free(world);
  });

  initEnterQuery(world).forEach(eid => {
    const proxy = PerspectiveCameraInitProxy.get(eid);
    const fov = proxy.fov;
    const aspect = proxy.aspect;
    const near = proxy.near;
    const far = proxy.far;
    proxy.free(world);

    const camera = new PerspectiveCamera(fov, aspect, near, far);
    EntityObject3DProxy.get(eid).addObject3D(world, camera);
    PerspectiveCameraProxy.get(eid).allocate(world, camera);
  });

  cameraWindowResizeEnterQuery(world).forEach(eid => {
    const camera = PerspectiveCameraProxy.get(eid).camera;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
};
