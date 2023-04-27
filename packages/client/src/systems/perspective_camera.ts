import {
  defineQuery,
  exitQuery,
  IWorld
} from "bitecs";
import {
  PerspectiveCameraComponent,
  PerspectiveCameraProxy
} from "../components/camera";
import { hasObject3D, removeObject3D } from "../utils/entity_object3d";

const cameraExitQuery = exitQuery(defineQuery([PerspectiveCameraComponent]));

export const perspectiveCameraSystem = (world: IWorld): void => {
  cameraExitQuery(world).forEach(eid => {
    const proxy = PerspectiveCameraProxy.get(eid);
    const camera = proxy.camera;

    if (hasObject3D(world, camera, eid)) {
      removeObject3D(world, camera, eid);
    }

    proxy.free();
  });
};
