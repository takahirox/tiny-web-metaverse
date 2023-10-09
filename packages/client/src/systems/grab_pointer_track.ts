import { addComponent, defineQuery, IWorld } from "bitecs";
import { Ray } from "three";
import {
  PerspectiveCameraProxy,
  PerspectiveCameraComponent,
  SceneCamera
} from "../components/camera";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";
import { Grabbed } from "../components/grab";
import { Pointer, PointerProxy } from "../components/pointer";
import { InScene } from "../components/scene";
import { TransformUpdated } from "../components/transform";

const ray = new Ray();

const cameraQuery = defineQuery([PerspectiveCameraComponent, SceneCamera]);
const pointerQuery = defineQuery([Pointer]);
const grabbedQuery = defineQuery([EntityObject3D, Grabbed, InScene]);

export const grabbedObjectsPointerTrackSystem = (world: IWorld) => {
  cameraQuery(world).forEach(cameraEid => {
    const camera = PerspectiveCameraProxy.get(cameraEid).camera;

    pointerQuery(world).forEach(pointerEid => {
      const proxy = PointerProxy.get(pointerEid);

      ray.origin.setFromMatrixPosition(camera.matrixWorld);
      ray.direction.set(proxy.x, proxy.y, 0.5).unproject(camera).sub(ray.origin).normalize();

      grabbedQuery(world).forEach(grabbedEid => {
        EntityObject3DProxy.get(grabbedEid).root
          .position.copy(ray.direction)
          .multiplyScalar(Grabbed.distance[grabbedEid])
          .add(ray.origin);
        addComponent(world, TransformUpdated, grabbedEid);
      });
    });
  });
};
