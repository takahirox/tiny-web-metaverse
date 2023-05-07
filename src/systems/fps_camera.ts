import { defineQuery, IWorld } from "bitecs";
import { Avatar } from "../components/avatar";
import {
  FpsCamera,
  PerspectiveCameraTag,
  PerspectiveCameraProxy
} from "../components/camera";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";
import { Owned } from "../components/network";

const avatarQuery = defineQuery([Avatar, EntityObject3D, Owned]);
const cameraQuery = defineQuery([FpsCamera, PerspectiveCameraTag]);
export const fpsCameraSystem = (world: IWorld) => {
  const avatarEids = avatarQuery(world);
  const cameraEids = cameraQuery(world);

  avatarEids.forEach(avatarEid => {
    const avatar = EntityObject3DProxy.get(avatarEid).root;
    avatar.updateWorldMatrix(true, true);

    cameraEids.forEach(cameraEid => {
      const camera = PerspectiveCameraProxy.get(cameraEid).camera;
      // TODO: Optimize
      camera.matrixWorld.identity();
      // TODO: Remove magic number
      camera.matrixWorld.elements[14] = -0.1;
      camera.matrixWorld.multiply(avatar.matrixWorld);
      camera.matrix.copy(camera.matrixWorld);
      camera.matrix.decompose(camera.position, camera.quaternion, camera.scale);
    });
  });
};
