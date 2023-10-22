import {
  defineQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  SceneComponent,
  SceneProxy
} from "../components/scene";
import {
  WebXRSessionEvent,
  WebXRSessionEventProxy,
  WebXRSessionEventType,
  WebXRSessionManager
} from "../components/webxr";
import { getXRSessionProxy } from "../utils/webxr";

const managerQuery = defineQuery([WebXRSessionEvent, WebXRSessionManager]);
const eventQuery = defineQuery([WebXRSessionEvent]);
const sceneQuery = defineQuery([SceneComponent]);

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
        }
      }
    }
  });
};

export const clearWebXREventSystem = (world: IWorld): void => {
  eventQuery(world).forEach(eid => {
    const proxy = WebXRSessionEventProxy.get(eid); 
    proxy.events.length = 0;
    proxy.free();
    removeComponent(world, WebXRSessionEvent, eid);
  });
};
