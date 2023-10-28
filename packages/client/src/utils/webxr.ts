import {
  addComponent,
  defineQuery,
  hasComponent,
  IWorld
} from "bitecs";
import {
  FirstXRController,
  SecondXRController,
  XRController,
  XRFrameComponent,
  XRFrameProxy,
  XRSessionComponent,
  XRSessionProxy,
  WebXRSessionEvent,
  WebXRSessionEventListener,
  WebXRSessionEventProxy,
  WebXRSessionEventType
} from "../components/webxr";
import { getRendererProxy } from "./bitecs_three";

const frameQuery = defineQuery([XRFrameComponent]);
const sessionQuery = defineQuery([XRSessionComponent]);
const listenerQuery = defineQuery([WebXRSessionEventListener]);
const firstControllerQuery = defineQuery([FirstXRController, XRController]);
const secondControllerQuery = defineQuery([SecondXRController, XRController]);

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

export const isXRPresenting = (world: IWorld): boolean => {
  const renderer = getRendererProxy(world).renderer;
  return renderer.xr.enabled && renderer.xr.isPresenting;
};

export const inVR = (world: IWorld): boolean => {
  if (!isXRPresenting(world)) {	
    return false;
  }

  return getXRSessionProxy(world).mode === 'immersive-vr';
};

export const inAR = (world: IWorld): boolean => {
  if (!isXRPresenting(world)) {	
    return false;
  }

  return getXRSessionProxy(world).mode === 'immersive-ar';
};

export const getFirstXRControllerEid = (world: IWorld): number => {
  // Assumes always only single first controller entity exists
  return firstControllerQuery(world)[0];
};

export const getSecondXRControllerEid = (world: IWorld): number => {
  // Assumes always only single second controller entity exists
  return secondControllerQuery(world)[0];
};
