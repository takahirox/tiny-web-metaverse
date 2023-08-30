import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld
} from "bitecs";
import {
  PerspectiveCameraComponent,
  PerspectiveCameraProxy
} from "../components/camera";
import { WindowResizeEvent, WindowSize } from "../components/window_resize";
import { hasObject3D, removeObject3D } from "../utils/entity_object3d";

const cameraExitQuery = exitQuery(defineQuery([PerspectiveCameraComponent]));
const cameraWindowResizeEnterQuery =
  enterQuery(defineQuery([PerspectiveCameraComponent, WindowResizeEvent, WindowSize]));

export const perspectiveCameraSystem = (world: IWorld): void => {
  cameraExitQuery(world).forEach(eid => {
    const proxy = PerspectiveCameraProxy.get(eid);
    const camera = proxy.camera;

    if (hasObject3D(world, camera, eid)) {
      removeObject3D(world, camera, eid);
    }

    proxy.free();
  });

  cameraWindowResizeEnterQuery(world).forEach(eid => {
    const camera = PerspectiveCameraProxy.get(eid).camera;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
};
