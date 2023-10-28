import {
  addComponent,
  defineQuery,
  exitQuery,
  hasComponent,
  IWorld
} from "bitecs";
import { Euler } from "three";
import { Avatar } from "../components/avatar";
import {
  AvatarMouseControls,
  AvatarMouseControlsProxy
} from "../components/avatar_mouse_controls";
import {
  EntityObject3D,
  EntityObject3DProxy,
} from "../components/entity_object3d";
import { Grabbed } from "../components/grab";
import {
  MouseButtonEvent,
  MouseButtonEventProxy,
  MouseButtonEventType,
  MouseButtonType
} from "../components/mouse";
import { Local } from "../components/network";
import { Raycasted, RaycastedNearest } from "../components/raycast";
import { TransformUpdated } from "../components/transform";
import {
  getCurrentMousePositionProxy,
  getPreviousMousePositionProxy
} from "../utils/mouse";

const euler = new Euler(0, 0, 0, 'YXZ');

const controlsQuery = defineQuery([AvatarMouseControls]);
const controlsExitQuery = exitQuery(controlsQuery);
const avatarQuery = defineQuery([Avatar, EntityObject3D, Local]);
const raycastedQuery = defineQuery([Raycasted, RaycastedNearest]);
const grabbedQuery = defineQuery([Grabbed]);

// TODO: Consider to reuse Three.js PointerLockControls?

// TODO: Make them configurable?
const MIN_POLAR_ANGLE = 0; // radians
const MAX_POLAR_ANGLE = Math.PI; // radians
const PI_2 = Math.PI / 2;

export const avatarMouseControlsSystem = (world: IWorld) => {
  controlsExitQuery(world).forEach(eid => {
    AvatarMouseControlsProxy.get(eid).free(); 
  });

  const raycastedExist = raycastedQuery(world).length > 0;
  const grabbedExist = grabbedQuery(world).length > 0;
  const avatarEids = avatarQuery(world);

  controlsQuery(world).forEach(controlsEid => {
    const controlsProxy = AvatarMouseControlsProxy.get(controlsEid);

    if (hasComponent(world, MouseButtonEvent, controlsEid)) {
      for (const e of MouseButtonEventProxy.get(controlsEid).events) {
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

    avatarEids.forEach(avatarEid => {
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
  });
};
