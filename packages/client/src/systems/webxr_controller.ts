import {
  addComponent,
  defineQuery,
  enterQuery,
  exitQuery,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import { Event, Group } from "three";
import {
  FirstSourceInteractable,
  FirstSourceInteractionLeaveEvent,
  FirstSourceInteractionTriggerEvent,
  SecondSourceInteractable,
  SecondSourceInteractionLeaveEvent,
  SecondSourceInteractionTriggerEvent
} from "../components/interact";
import {
  FirstRay,
  RayComponent,
  RayProxy
} from "../components/ray";
import { InScene } from "../components/scene";
import {
  ActiveXRController,
  FirstXRController,
  SecondXRController,
  XRController,
  XRControllerConnectionEvent,
  XRControllerConnectionEventListener,
  XRControllerConnectionEventProxy,
  XRControllerConnectionEventType,
  XRControllerConnectionEventValue,
  XRControllerSelectEvent,
  XRControllerSelectEventListener,
  XRControllerSelectEventProxy,
  XRControllerSelectEventType,
  XRControllerProxy,
  XRControllerType
} from "../components/webxr";
import {
  getFirstXRControllerEid,
  getSecondXRControllerEid,
  isXRPresenting
} from "../utils/webxr";

const addConnectionEvent = (
  world: IWorld,
  eid: number,
  controller: XRControllerType,
  type: XRControllerConnectionEventType
): void => {
  if (!hasComponent(world, XRControllerConnectionEvent, eid)) {
    addComponent(world, XRControllerConnectionEvent, eid);
    XRControllerConnectionEventProxy.get(eid).allocate();
  }
  XRControllerConnectionEventProxy.get(eid).add(controller, type);
};

const addSelectEvent = (
  world: IWorld,
  eid: number,
  controller: XRControllerType,
  type: XRControllerSelectEventType
): void => {
  if (!hasComponent(world, XRControllerSelectEvent, eid)) {
    addComponent(world, XRControllerSelectEvent, eid);
    XRControllerSelectEventProxy.get(eid).allocate();
  }
  XRControllerSelectEventProxy.get(eid).add(controller, type);
};

const getControllerType = (world: IWorld, controller: Group): XRControllerType => {
  if (controller === XRControllerProxy.get(getFirstXRControllerEid(world)).controller) {
    return XRControllerType.First;
  }
  if (controller === XRControllerProxy.get(getSecondXRControllerEid(world)).controller) {
    return XRControllerType.Second;
  }
  throw new Error(`Unknown XRController ${controller}`);
};

// TODO: Should this queue be in component?
const connectionEventQueue: {
  controller: Group,
  type: XRControllerConnectionEventType
}[] = [];

const onConnected = (event: Event): void => {
  connectionEventQueue.push({
    controller: event.target,
    type: XRControllerConnectionEventType.Connected
  });
};

const onDisconnected = (event: Event): void => {
  connectionEventQueue.push({
    controller: event.target,
    type: XRControllerConnectionEventType.Disconnected
  });
};

// TODO: Should this queue be in component?
const selectEventQueue: {
  controller: Group,
  type: XRControllerSelectEventType
}[] = [];

const onSelectStart = (event: Event): void => {
  selectEventQueue.push({
    controller: event.target,
    type: XRControllerSelectEventType.Start
  });
};

const onSelectEnd = (event: Event): void => {
  selectEventQueue.push({
    controller: event.target,
    type: XRControllerSelectEventType.End
  });
};

const controllerQuery = defineQuery([XRController]);
const enterControllerQuery = enterQuery(controllerQuery);
const exitControllerQuery = exitQuery(controllerQuery);

const connectionListenerQuery = defineQuery([XRControllerConnectionEventListener]);
const connectionEventQuery = defineQuery([XRControllerConnectionEvent]);

const selectListenerQuery = defineQuery([XRControllerSelectEventListener]);
const selectEventQuery = defineQuery([XRControllerSelectEvent]);

const firstControllerConnectionQuery = defineQuery([FirstXRController, XRController, XRControllerConnectionEvent]);
const secondControllerConnectionQuery = defineQuery([SecondXRController, XRController, XRControllerConnectionEvent]);

const firstInteractableQuery = defineQuery([FirstSourceInteractable, XRControllerSelectEvent]);
const secondInteractableQuery = defineQuery([SecondSourceInteractable, XRControllerSelectEvent]);

const firstRayQuery = defineQuery([FirstRay, RayComponent]);
const firstActiveControllerQuery = defineQuery([ActiveXRController, FirstXRController]);

// TODO: Implement second ray query

export const webxrControllerEventHandlingSystem = (world: IWorld): void => {
  exitControllerQuery(world).forEach(eid => {
    const controller = XRControllerProxy.get(eid).controller;
    controller.removeEventListener('connected', onConnected);
    controller.removeEventListener('disconnected', onDisconnected);
    controller.removeEventListener('selectstart', onSelectStart);
    controller.removeEventListener('selectend', onSelectEnd);
  });

  enterControllerQuery(world).forEach(eid => {
    const controller = XRControllerProxy.get(eid).controller;
    controller.addEventListener('connected', onConnected);
    controller.addEventListener('disconnected', onDisconnected);
    controller.addEventListener('selectstart', onSelectStart);
    controller.addEventListener('selectend', onSelectEnd);
  });

  for (const e of connectionEventQueue) {
    connectionListenerQuery(world).forEach(eid => {
      addConnectionEvent(world, eid, getControllerType(world, e.controller), e.type);
    });
  }

  connectionEventQueue.length = 0;

  for (const e of selectEventQueue) {
    selectListenerQuery(world).forEach(eid => {
      addSelectEvent(world, eid, getControllerType(world, e.controller), e.type);
    });
  }

  selectEventQueue.length = 0;
};

const handleConnectionEvent = (world: IWorld, eid: number, e: XRControllerConnectionEventValue): void => {
  if (e.type === XRControllerConnectionEventType.Connected) {
    addComponent(world, ActiveXRController, eid);
    // Is InScene really necessary?
    addComponent(world, InScene, eid);
  } else if (e.type === XRControllerConnectionEventType.Disconnected) {
    removeComponent(world, ActiveXRController, eid);
    removeComponent(world, InScene, eid);
  }
};

export const webxrControllerSystem = (world: IWorld): void => {
  firstControllerConnectionQuery(world).forEach(eid => {
    for (const e of XRControllerConnectionEventProxy.get(eid).events) {
      if (e.controller !== XRControllerType.First) {
        continue;
      }
      handleConnectionEvent(world, eid, e);
    }
  });

  secondControllerConnectionQuery(world).forEach(eid => {
    for (const e of XRControllerConnectionEventProxy.get(eid).events) {
      if (e.controller !== XRControllerType.Second) {
        continue;
      }
      handleConnectionEvent(world, eid, e);
    }
  });

  firstInteractableQuery(world).forEach(eid => {
    for (const e of XRControllerSelectEventProxy.get(eid).events) {
      if (e.controller !== XRControllerType.First) {
        continue;
      }
      if (e.type === XRControllerSelectEventType.Start) {
        addComponent(world, FirstSourceInteractionTriggerEvent, eid);
      } else if (e.type === XRControllerSelectEventType.End) {
        addComponent(world, FirstSourceInteractionLeaveEvent, eid);
      }
    }
  });

  secondInteractableQuery(world).forEach(eid => {
    for (const e of XRControllerSelectEventProxy.get(eid).events) {
      if (e.controller !== XRControllerType.Second) {
        continue;
      }
      if (e.type === XRControllerSelectEventType.Start) {
        addComponent(world, SecondSourceInteractionTriggerEvent, eid);
      } else if (e.type === XRControllerSelectEventType.End) {
        addComponent(world, SecondSourceInteractionLeaveEvent, eid);
      }
    }
  });

  if (!isXRPresenting(world)) {
    return;
  }

  // TODO: If controller is inactive, what ray should be?
  // TODO: Controller may not be in scene yet at the first frame when controller is connected.
  firstActiveControllerQuery(world).forEach(controllerEid => {
    firstRayQuery(world).forEach(rayEid => {
      const ray = RayProxy.get(rayEid).ray;
      const controller = XRControllerProxy.get(controllerEid).controller;

      ray.origin.copy(controller.position);
      // TODO: Is this calculation correct?
      ray.direction.set(0, 0, -1.0).applyQuaternion(controller.quaternion);
    });
  });
};

export const clearWebXRControllerEventSystem = (world: IWorld): void => {
  connectionEventQuery(world).forEach(eid => {
    const proxy = XRControllerConnectionEventProxy.get(eid);
    proxy.events.length = 0;
    proxy.free();
    removeComponent(world, XRControllerConnectionEvent, eid);
  });

  selectEventQuery(world).forEach(eid => {
    const proxy = XRControllerSelectEventProxy.get(eid);
    proxy.events.length = 0;
    proxy.free();
    removeComponent(world, XRControllerSelectEvent, eid);
  });
};
