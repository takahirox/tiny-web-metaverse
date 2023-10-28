import { defineQuery, IWorld } from "bitecs";
import { Matrix4, Quaternion, Vector3 } from "three";
import { Avatar } from "../components/avatar";
import {
  PerspectiveCameraComponent,
  PerspectiveCameraProxy,
  SceneCamera
} from "../components/camera";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";
import { Local } from "../components/network";
import { getRendererProxy } from "../utils/bitecs_three";
import { isXRPresenting } from "../utils/webxr";

const cameraQuery = defineQuery([SceneCamera, PerspectiveCameraComponent]);
const avatarQuery = defineQuery([Avatar, Local, EntityObject3D]);

const mat4 = new Matrix4();
const pos = new Vector3();
const quat = new Quaternion();
const scale = new Vector3();

export const webxrCameraSystem = (world: IWorld): void => {
  if (!isXRPresenting(world)) {
    return;
  }

  const renderer = getRendererProxy(world).renderer;
  // Assumes always single camera entity exists while in immersive mode.
  cameraQuery(world).forEach(eid => {
    const camera = PerspectiveCameraProxy.get(eid).camera;
    renderer.xr.updateCamera(camera);
    avatarQuery(world).forEach(eid => {
      // TODO: Consider avatar's height and eyes position
      // TODO: Consider device's camera position in AR
      // TODO: Optimize
      const avatar = EntityObject3DProxy.get(eid).root;

      mat4.identity();
      // TODO: Remove magic number
      mat4.elements[14] = 0.2;
      mat4.premultiply(camera.matrix);
      mat4.decompose(pos, quat, scale);

      avatar.position.copy(pos);
      avatar.quaternion.copy(quat);
    });
  });
};
