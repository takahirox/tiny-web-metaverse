import {
  addComponent,
  defineQuery,
  hasComponent,
  IWorld
} from "bitecs";
import { toGenerator } from "./coroutine";
import {
  XRFrameComponent,
  XRFrameProxy,
  XRSessionComponent,
  XRSessionProxy,
  WebXRSessionEvent,
  WebXRSessionEventListener,
  WebXRSessionEventProxy,
  WebXRSessionEventType
} from "../components/webxr";

const frameQuery = defineQuery([XRFrameComponent]);
const sessionQuery = defineQuery([XRSessionComponent]);
const listenerQuery = defineQuery([WebXRSessionEventListener]);

export const getXRFrameProxy = (world: IWorld): XRFrameProxy => {
  // Assumes always single xr frame entity exists
  return XRFrameProxy.get(frameQuery(world)[0]);
};

export const getXRSessionProxy = (world: IWorld): XRSessionProxy => {
  // Assumes always single xr session entity exists
  return XRSessionProxy.get(sessionQuery(world)[0]);
};

export const addWebXRSessionEvent = (
  world: IWorld,
  type: WebXRSessionEventType,
  mode: XRSessionMode,
  session: XRSession
): void => {
  listenerQuery(world).forEach(eid => {
    if (!hasComponent(world, WebXRSessionEvent, eid)) {
      addComponent(world, WebXRSessionEvent, eid);
      WebXRSessionEventProxy.get(eid).allocate();
    }
    WebXRSessionEventProxy.get(eid).add(type, mode, session);
  });
};

export function* isSessionSupported(mode: XRSessionMode): Generator<void, boolean> {
  return yield* toGenerator(new Promise(resolve => {
    if (!('xr' in navigator)) {
      resolve(false);
      return;
    }

    navigator.xr
      .isSessionSupported(mode)
      .then(resolve)
      .catch(e => {
        // Resolve as unsupported if fails. Is this correct?
        console.error(e);
        resolve(false);
      });
  }));
};

export function* requestSession(mode: XRSessionMode, sessionInit: XRSessionInit = {
  // Not deeply thought yet...
  optionalFeatures: [
    'local-floor',
    'bounded-floor',
    'hand-tracking',
    'layers'
  ]
}): Generator<void, XRSession> {
  return yield* toGenerator(new Promise((resolve, reject) => {
    navigator.xr
      .requestSession(mode, sessionInit)
      .then(resolve)
      .catch(reject)
  }));
};
