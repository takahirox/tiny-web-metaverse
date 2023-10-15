import {
  addComponent,
  defineQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  Avatar,
  EntityObject3D,
  EntityObject3DProxy,
  LinearMoveBackward,
  LinearMoveForward,
  LinearMoveLeft,
  LinearMoveRight,
  Local,
  TransformUpdated
} from "@tiny-web-metaverse/client/src";
import { Euler } from "three";
import {
  VirtualJoystick,
  VirtualJoystickLeft,
  VirtualJoystickProxy,
  VirtualJoystickRight
} from "../components/virtual_joystick";

const euler = new Euler(0, 0, 0, 'YXZ');

// TODO: Make them configurable?
const MIN_POLAR_ANGLE = 0; // radians
const MAX_POLAR_ANGLE = Math.PI; // radians
const PI_2 = Math.PI / 2;

const leftQuery = defineQuery([VirtualJoystick, VirtualJoystickLeft]);
const rightQuery = defineQuery([VirtualJoystick, VirtualJoystickRight]);
const avatarQuery = defineQuery([Avatar, EntityObject3D, Local]);

// TODO: Avatar can be controled with other operation (eg: Key or mouse).
//       Avoid the Avatar controls conflicts if possible.

export const avatarVirtualJoystickSystem = (world: IWorld): void => {
  leftQuery(world).forEach(eid => {
    const proxy = VirtualJoystickProxy.get(eid);

    // TODO: Optimize and simplify
    avatarQuery(world).forEach(avatarEid => {
      removeComponent(world, LinearMoveBackward, avatarEid);
      removeComponent(world, LinearMoveForward, avatarEid);
      removeComponent(world, LinearMoveLeft, avatarEid);
      removeComponent(world, LinearMoveRight, avatarEid);

      if (!proxy.active) {
        return;
      }

      // TODO: Configurable movement speed

      if (proxy.x > 0.0) {
        addComponent(world, LinearMoveRight, avatarEid);
        LinearMoveRight.speed[avatarEid] = proxy.x;
      } else if (proxy.x < 0.0) {
        addComponent(world, LinearMoveLeft, avatarEid);
        LinearMoveLeft.speed[avatarEid] = -proxy.x;
      }

      if (proxy.y > 0.0) {
        addComponent(world, LinearMoveForward, avatarEid);
        LinearMoveForward.speed[avatarEid] = proxy.y;
      } else if (proxy.y < 0.0) {
        addComponent(world, LinearMoveBackward, avatarEid);
        LinearMoveBackward.speed[avatarEid] = -proxy.y;
      }
    });
  });

  rightQuery(world).forEach(eid => {
    const proxy = VirtualJoystickProxy.get(eid);

    if (!proxy.active) {
      return;
    }

    avatarQuery(world).forEach(avatarEid => {
      const avatar = EntityObject3DProxy.get(avatarEid).root;

      // TODO: Configurable rotation speed
      // TODO: Add LinearRotation component?
      const dx = proxy.x * 0.01;
      const dy = proxy.y * 0.01;

      euler.setFromQuaternion(avatar.quaternion);
      euler.y -= dx;
      euler.x += dy;
      euler.x = Math.max(PI_2 - MAX_POLAR_ANGLE, Math.min(PI_2 - MIN_POLAR_ANGLE, euler.x));
      avatar.quaternion.setFromEuler(euler);

      addComponent(world, TransformUpdated, avatarEid);
    });
  });
};
