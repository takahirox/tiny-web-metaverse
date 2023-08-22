import {
  defineQuery,
  enterQuery,
  exitQuery,
  hasComponent,
  IWorld
} from "bitecs";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";
import {
  PerspectiveCameraProxy,
  PerspectiveCameraTag
} from "../components/camera";
import { WindowResizeEvent, WindowSize } from "../components/window_resize";

const cameraExitQuery = exitQuery(defineQuery([PerspectiveCameraTag]));
const cameraWindowResizeEnterQuery =
  enterQuery(defineQuery([PerspectiveCameraTag, WindowResizeEvent, WindowSize]));

export const perspectiveCameraSystem = (world: IWorld): void => {
  cameraExitQuery(world).forEach(eid => {
    const proxy = PerspectiveCameraProxy.get(eid);
    const camera = proxy.camera;

    if (hasComponent(world, EntityObject3D, eid)) {
      EntityObject3DProxy.get(eid).removeObject3D(world, camera);
    }

    proxy.free();
  });

  cameraWindowResizeEnterQuery(world).forEach(eid => {
    const camera = PerspectiveCameraProxy.get(eid).camera;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
};
