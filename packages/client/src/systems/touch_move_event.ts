import {
  addComponent,
  defineQuery,
  enterQuery,
  exitQuery,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import {
  TouchMoveEvent,
  TouchMoveEventHandler,
  TouchMoveEventHandlerProxy,
  TouchMoveEventHandlerReady,
  TouchMoveEventListener,
  TouchMoveEventProxy
} from "../components/touch";

const handlerQuery = defineQuery([TouchMoveEventHandler]);
const handlerEnterQuery = enterQuery(handlerQuery);
const handlerExitQuery = exitQuery(handlerQuery);
const listenerQuery = defineQuery([TouchMoveEventListener]);
const eventQuery = defineQuery([TouchMoveEvent]);

const addEvent = (world: IWorld, eid: number, x: number, y: number): void => {
  if (!hasComponent(world, TouchMoveEvent, eid)) {
    addComponent(world, TouchMoveEvent, eid);
    TouchMoveEventProxy.get(eid).allocate();
  }
  TouchMoveEventProxy.get(eid).add(x, y);
};

export const touchMoveEventHandleSystem = (world: IWorld) => {
  handlerExitQuery(world).forEach(eid => {
    const proxy = TouchMoveEventHandlerProxy.get(eid);

    if (proxy.listenersAlive) {
      const target = proxy.target;
      target.removeEventListener('touchmove', proxy.listener);
    }

    if (hasComponent(world, TouchMoveEventHandlerReady, eid)) {
      removeComponent(world, TouchMoveEventHandlerReady, eid);
    }

    proxy.free();
  });

  handlerEnterQuery(world).forEach(eid => {
    const proxy = TouchMoveEventHandlerProxy.get(eid);
    const target = proxy.target;

    const listener = (event: TouchEvent): void => {
      // TODO: Support multiple touches
      // TODO: Is using pageX/Y correct?
      const touch = event.touches[0];
      listenerQuery(world).forEach(eid => {
        addEvent(
          world,
          eid,
          (touch.pageX / target.clientWidth) * 2.0 - 1.0,
          -((touch.pageY / target.clientHeight) * 2.0 - 1.0)
        );
      });
    };

    target.addEventListener('touchmove', listener);
    TouchMoveEventHandlerProxy.get(eid).allocate(listener);
    addComponent(world, TouchMoveEventHandlerReady, eid);
  });
};

export const touchMoveEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    TouchMoveEventProxy.get(eid).free();
    removeComponent(world, TouchMoveEvent, eid);
  });
};
