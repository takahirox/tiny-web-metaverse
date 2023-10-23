import {
  defineQuery,
  IWorld,
  removeComponent
} from "bitecs";
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
import {
  SceneComponent,
  SceneProxy
} from "../components/scene";
import { getRendererProxy } from "../utils/bitecs_three";
import {
  InvisibleInAR,
  WebXRSessionEvent,
  WebXRSessionEventProxy,
  WebXRSessionEventType,
  WebXRSessionManager
} from "../components/webxr";
import { getXRSessionProxy } from "../utils/webxr";

const managerQuery = defineQuery([WebXRSessionEvent, WebXRSessionManager]);
const eventQuery = defineQuery([WebXRSessionEvent]);
const sceneQuery = defineQuery([SceneComponent]);
const invisibleQuery = defineQuery([EntityObject3D, InvisibleInAR]);
const cameraQuery = defineQuery([SceneCamera, PerspectiveCameraComponent]);
const avatarQuery = defineQuery([Avatar, Local, EntityObject3D]);

export const webxrSessionManagementSystem = (world: IWorld): void => {
  // Assumes up to one manager entity
  managerQuery(world).forEach(eid => {
    for (const e of WebXRSessionEventProxy.get(eid).events) {
      const proxy = getXRSessionProxy(world);
      if (e.type === WebXRSessionEventType.Start) {
        proxy.session = e.session;

        // In immersive AR mode, background and environment may not be needed
        // in general because real-world enviroment should be preferred.
        // As hack and experiment, remove them here and restore when leaving
        // AR session.
        // We do the same operation to the specified InvisibleInAR entities.
        // TODO: Implement more properly with ECS architecture
        if (e.mode === 'immersive-ar') {
          sceneQuery(world).forEach(sceneEid => {
            const scene = SceneProxy.get(sceneEid).scene;

            if (scene.background !== null) {
              scene.userData.originalBackground = scene.background;
              scene.background = null;
            }
            if (scene.environment !== null) {
              scene.userData.originalEnvironment = scene.environment;
              scene.environment = null;
            }
          });

          // TODO: Fix me with more proper ECS approach
          //       The current operation can be problematic because
          //       visibility can be changed or root object can be
          //       replaced while in AR mode.
          invisibleQuery(world).forEach(objEid => {
            const root = EntityObject3DProxy.get(objEid).root;
            root.userData.originalVisible = root.visible;
            root.visible = false;
          });

          // TODO: Use lighting estimation
        }
      } else if (e.type === WebXRSessionEventType.End) {
        proxy.session = null;

        if (e.mode === 'immersive-ar') {
          sceneQuery(world).forEach(sceneEid => {
            const scene = SceneProxy.get(sceneEid).scene;

            if (scene.userData.originalBackground) {
              scene.background = scene.userData.originalBackground;
              delete scene.userData.originalBackground;
            }
            if (scene.userData.originalEnvironment) {
              scene.environment = scene.userData.originalEnvironment;
              delete scene.userData.originalEnvironment;
            }
          });

          invisibleQuery(world).forEach(objEid => {
            const root = EntityObject3DProxy.get(objEid).root;
            root.visible = root.userData.originalVisible;
            delete root.userData.originalVisible;
          });
        }
      }
    }
  });
};

const mat4 = new Matrix4();
const pos = new Vector3();
const quat = new Quaternion();
const scale = new Vector3();

export const webxrCameraSystem = (world: IWorld): void => {
  const renderer = getRendererProxy(world).renderer;
  if (renderer.xr.enabled && renderer.xr.isPresenting) {
    // Assumes always single camera entity exists while in immersive mode.
    cameraQuery(world).forEach(eid => {
      const camera = PerspectiveCameraProxy.get(eid).camera;
      renderer.xr.updateCamera(camera);
      avatarQuery(world).forEach(eid => {
        // TODO: Consider avatar's height and eyes position
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
  }
};

export const clearWebXREventSystem = (world: IWorld): void => {
  eventQuery(world).forEach(eid => {
    const proxy = WebXRSessionEventProxy.get(eid); 
    proxy.events.length = 0;
    proxy.free();
    removeComponent(world, WebXRSessionEvent, eid);
  });
};
