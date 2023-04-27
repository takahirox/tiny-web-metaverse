import {
  addComponent,
  defineQuery,
  hasComponent,
  IWorld
} from "bitecs";
import { Euler } from "three";
import { Grabbed } from "@tiny-web-metaverse/addons/src";
import {
  Avatar,
  EntityObject3D,
  EntityObject3DProxy,
  getCurrentMousePositionProxy,
  getPreviousMousePositionProxy,
  Local,
  MouseButtonEvent,
  MouseButtonEventProxy,
  MouseButtonEventType,
  MouseButtonType,
  Raycasted,
  RaycastedNearest,
  TransformUpdated
} from "@tiny-web-metaverse/client/src";
import {
  AvatarMouseControls,
  AvatarMouseControlsProxy
} from "../components/avatar_mouse_controls";

const euler = new Euler(0, 0, 0, 'YXZ');

const avatarQuery = defineQuery([Avatar, AvatarMouseControls, EntityObject3D, Local]);
const raycastedQuery = defineQuery([Raycasted, RaycastedNearest]);
// TODO: Can we remove the dependency with Grabbed?
const grabbedQuery = defineQuery([Grabbed]);

// TODO: Consider to reuse Three.js PointerLockControls?

// TODO: Make them configurable?
const MIN_POLAR_ANGLE = 0; // radians
const MAX_POLAR_ANGLE = Math.PI; // radians
const PI_2 = Math.PI / 2;

export const avatarMouseControlsSystem = (world: IWorld) => {
  const raycastedExist = raycastedQuery(world).length > 0;
  const grabbedExist = grabbedQuery(world).length > 0;

  avatarQuery(world).forEach(avatarEid => {
    const controlsProxy = AvatarMouseControlsProxy.get(avatarEid);

    if (hasComponent(world, MouseButtonEvent, avatarEid)) {
      for (const e of MouseButtonEventProxy.get(avatarEid).events) {
        if (e.button !== MouseButtonType.Left) {
          continue;
        }
        if (controlsProxy.enabled) {
          if (e.type === MouseButtonEventType.Up) {
            controlsProxy.enabled = false;
          }
        } else {
          if (e.type === MouseButtonEventType.Down &&
            !raycastedExist &&
            !grabbedExist) {
            controlsProxy.enabled = true;
          }
        }
      }
    }

    if (!controlsProxy.enabled) {
      return;
    }

    const avatar = EntityObject3DProxy.get(avatarEid).root;

    const { x: currentX, y: currentY } = getCurrentMousePositionProxy(world);
    const { x: previousX, y: previousY } = getPreviousMousePositionProxy(world);

    const dx = currentX - previousX;
    const dy = currentY - previousY;

    // TODO: Configurable rotation speed
    // TODO: Add LinearRotation component?
    euler.setFromQuaternion(avatar.quaternion);
    euler.y -= dx;
    euler.x += dy;
    euler.x = Math.max(PI_2 - MAX_POLAR_ANGLE, Math.min(PI_2 - MIN_POLAR_ANGLE, euler.x));
    avatar.quaternion.setFromEuler(euler);

    addComponent(world, TransformUpdated, avatarEid);
  });
};
