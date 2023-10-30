import {
  addComponent,
  defineQuery,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import {
  ActiveRay,
  FirstRay,
  RayComponent,
  SecondRay
} from "../components/ray";
import {
  WebXRSessionEvent,
  WebXRSessionEventProxy,
  WebXRSessionEventType,
  XRControllerConnectionEvent,
  XRControllerConnectionEventProxy,
  XRControllerConnectionEventType
} from "../components/webxr";
import { isXRPresenting } from "../utils/webxr";

const sessionEventQuery = defineQuery([RayComponent, WebXRSessionEvent]);
const connectionEventQuery = defineQuery([RayComponent, XRControllerConnectionEvent]);

export const webxrRaySystem = (world: IWorld): void => {
  sessionEventQuery(world).forEach(eid => {
    for (const e of WebXRSessionEventProxy.get(eid).events) {
      if (e.type === WebXRSessionEventType.Start) {
        // Deactivate rays once session starts,
        // and activate when a corresponding input source is connected
        if (hasComponent(world, ActiveRay, eid)) {
          removeComponent(world, ActiveRay, eid);
        }
      } else if (e.type === WebXRSessionEventType.End) {
        // Activate first ray and deactivate second ray when session ends
        if (hasComponent(world, FirstRay, eid) && !hasComponent(world, ActiveRay, eid)) {
          addComponent(world, ActiveRay, eid);
        }
        if (hasComponent(world, SecondRay, eid) && hasComponent(world, ActiveRay, eid)) {
          removeComponent(world, ActiveRay, eid);
        }
      }
    }
  });

  // TODO: Check if this guard is good
  if (isXRPresenting(world)) {
    connectionEventQuery(world).forEach(eid => {
      for (const e of XRControllerConnectionEventProxy.get(eid).events) { 
        if (e.type === XRControllerConnectionEventType.Connected) {
          if (!hasComponent(world, ActiveRay, eid)) {
            addComponent(world, ActiveRay, eid);
          }
        } else if (e.type === XRControllerConnectionEventType.Disconnected) {
          if (hasComponent(world, ActiveRay, eid)) {
            removeComponent(world, ActiveRay, eid);
          }
        }
      }
    });
  }
};
