import {
  defineQuery,
  IWorld
} from "bitecs";
import { Pointer, PointerProxy } from "../components/pointer";
import { FirstRay, RayComponent, RayProxy } from "../components/ray";
import { getSceneCameraProxy } from "../utils/bitecs_three";
import { inVR } from "../utils/webxr";

const rayQuery = defineQuery([RayComponent, FirstRay]);
const pointerQuery = defineQuery([Pointer]);

export const raySystem = (world: IWorld): void => {
  // This operation is done in WebXR system if in VR mode
  if (inVR(world)) {
    return;
  }

  rayQuery(world).forEach(rayEid => {
    pointerQuery(world).forEach(pointerEid => {
      const ray = RayProxy.get(rayEid).ray;
      const pointerProxy = PointerProxy.get(pointerEid);
      const camera = getSceneCameraProxy(world).camera;
      ray.origin.copy(camera.position);
      ray.direction
        .set(pointerProxy.x, pointerProxy.y, 0.5)
        .unproject(camera)
        .sub(ray.origin)
        .normalize();
    });
  });
};
