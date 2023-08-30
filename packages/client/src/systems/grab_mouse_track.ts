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
import {
  MousePosition,
  MousePositionProxy
} from "../components/mouse";
import { InScene } from "../components/scene";
import { TransformUpdated } from "../components/transform";

const ray = new Ray();

const cameraQuery = defineQuery([PerspectiveCameraComponent, SceneCamera]);
const mouseQuery = defineQuery([MousePosition]);
const grabbedQuery = defineQuery([EntityObject3D, Grabbed, InScene]);

export const grabbedObjectsMouseTrackSystem = (world: IWorld) => {
  const cameraEids = cameraQuery(world);
  const mouseEids = mouseQuery(world);
  const grabbedEids = grabbedQuery(world);

  cameraEids.forEach(cameraEid => {
    const camera = PerspectiveCameraProxy.get(cameraEid).camera;

    mouseEids.forEach(mouseEid => {
      const proxy = MousePositionProxy.get(mouseEid);

      ray.origin.setFromMatrixPosition(camera.matrixWorld);
      ray.direction.set(proxy.x, proxy.y, 0.5).unproject(camera).sub(ray.origin).normalize();

      grabbedEids.forEach(grabbedEid => {
        EntityObject3DProxy.get(grabbedEid).root
          .position.copy(ray.direction)
          .multiplyScalar(Grabbed.distance[grabbedEid])
          .add(ray.origin);
        addComponent(world, TransformUpdated, grabbedEid);
      });
    });
  });
};
