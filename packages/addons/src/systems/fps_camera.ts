import { defineQuery, IWorld } from "bitecs";
import {
  Avatar,
  EntityObject3D,
  EntityObject3DProxy,
  FpsCamera,
  Local,
  PerspectiveCameraComponent,
  PerspectiveCameraProxy
} from "@tiny-web-metaverse/client/src";

const avatarQuery = defineQuery([Avatar, EntityObject3D, Local]);
const cameraQuery = defineQuery([FpsCamera, PerspectiveCameraComponent]);

export const fpsCameraSystem = (world: IWorld) => {
  const avatarEids = avatarQuery(world);
  const cameraEids = cameraQuery(world);

  avatarEids.forEach(avatarEid => {
    const avatar = EntityObject3DProxy.get(avatarEid).root;
    avatar.updateWorldMatrix(true, true);

    cameraEids.forEach(cameraEid => {
      const camera = PerspectiveCameraProxy.get(cameraEid).camera;
      // TODO: Optimize
      camera.matrix.identity();
      // TODO: Remove magic number
      camera.matrix.elements[14] = -0.2;
      camera.matrix.premultiply(avatar.matrix);
      camera.matrix.decompose(camera.position, camera.quaternion, camera.scale);
    });
  });
};
