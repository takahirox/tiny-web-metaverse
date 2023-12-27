import {
  addComponent,
  defineQuery,
  IWorld,
  Not
} from "bitecs";
import { Matrix4, Object3D, Quaternion, Vector3 } from "three";
import {
  Avatar,
  EntityObject3D,
  EntityObject3DProxy,
  getTimeProxy,
  LinearRotate,
  Local,
  MessageEvent,
  MessageEventProxy,
  Remote
} from "@tiny-web-metaverse/client/src";
import {
  AIAvatar,
  AIAvatarCommand,
  AIAvatarProxy
} from "../components/ai_avatar";

const INTERVAL = 60;
const mat4 = new Matrix4();
const quat = new Quaternion();
const vec3_1 = new Vector3();
const vec3_2 = new Vector3();

const lookAt = (avatar: Object3D, target: Vector3): void => {
  avatar.updateMatrix();
  vec3_2.setFromMatrixPosition(avatar.matrix);
  mat4.lookAt(vec3_2, target, avatar.up);
  avatar.quaternion.setFromRotationMatrix(mat4);
};

const commandQuery = defineQuery([AIAvatarCommand, MessageEvent]);
const localAvatarQuery = defineQuery([Not(AIAvatar), Avatar, EntityObject3D, Local]);
const remoteAvatarQuery = defineQuery([Avatar, EntityObject3D, Remote]);
const avatarQuery = defineQuery([AIAvatar, Avatar, EntityObject3D, Local]);

// This system is just experiment now.
// Not optimized and not so straightforward but acceptable.

export const aiAvatarSystem = (world: IWorld): void => {
  commandQuery(world).forEach(eid => {
    for (const e of MessageEventProxy.get(eid).events) {
      if (e.data && e.data.action === 'twm_ai_avatar') {
        localAvatarQuery(world).forEach(avatarEid => {
          addComponent(world, AIAvatar, avatarEid);
          AIAvatarProxy.get(avatarEid).allocate();
        });
      }
    }
  });

  // TODO: Optimize and Simplify
  avatarQuery(world).forEach(eid => {
    const proxy = AIAvatarProxy.get(eid);

    if (proxy.interval === 0.0) {
      // Find a next target
      const avatarEids = remoteAvatarQuery(world);

      if (avatarEids.length > 0) {
        const targetEid = avatarEids[Math.floor(avatarEids.length * Math.random())];
        const root = EntityObject3DProxy.get(targetEid).root;
        proxy.targetPosition.copy(root.position);
        proxy.targetQuaternion.copy(root.quaternion);
      }

      proxy.interval = INTERVAL;
      return;
    }

    const delta = getTimeProxy(world).delta;
    proxy.interval = Math.max(proxy.interval - delta, 0.0);

    const root = EntityObject3DProxy.get(eid).root;

    // Destination position
    // TODO: Remove magic number
    const destination =
      vec3_1.set(0, 0, -1)
        .applyQuaternion(proxy.targetQuaternion)
        .multiplyScalar(2.0)
        .add(proxy.targetPosition);

    if (!root.position.equals(destination)) {
      const speed = 1.0;
      vec3_2.copy(destination).sub(root.position);
      const distance = vec3_2.length();
	  if (speed * delta >= distance) {
        root.position.copy(destination);

        // TODO: Simplify
        quat.copy(root.quaternion);
        lookAt(root, proxy.targetPosition);

        addComponent(world, LinearRotate, eid);
        // TODO: Configurable
        LinearRotate.duration[eid] = 2.0;
        LinearRotate.targetX[eid] = root.quaternion.x;
        LinearRotate.targetY[eid] = root.quaternion.y;
        LinearRotate.targetZ[eid] = root.quaternion.z;
        LinearRotate.targetW[eid] = root.quaternion.w;

        root.quaternion.copy(quat);
      } else {
        root.position.add(vec3_2.normalize().multiplyScalar(speed * delta));
        lookAt(root, destination);
      }
    }
  });
};
