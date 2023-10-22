import {
  defineQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  WebXRSessionEvent,
  WebXRSessionEventProxy,
  WebXRSessionEventType,
  WebXRSessionManager
} from "../components/webxr";
import { getXRSessionProxy } from "../utils/webxr";

const managerQuery = defineQuery([WebXRSessionEvent, WebXRSessionManager]);
const eventQuery = defineQuery([WebXRSessionEvent]);

export const webxrSessionManagementSystem = (world: IWorld): void => {
  // Assumes up to one manager entity
  managerQuery(world).forEach(eid => {
    for (const e of WebXRSessionEventProxy.get(eid).events) {
      const proxy = getXRSessionProxy(world);
      if (e.type === WebXRSessionEventType.Start) {
        proxy.session = e.session;
      } else if (e.type === WebXRSessionEventType.End) {
        proxy.session = null;
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
