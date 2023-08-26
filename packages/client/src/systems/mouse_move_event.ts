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
  MouseMoveEvent,
  MouseMoveEventHandler,
  MouseMoveEventHandlerProxy,
  MouseMoveEventHandlerReady,
  MouseMoveEventListener,
  MouseMoveEventProxy
} from "../components/mouse";

const handlerQuery = defineQuery([MouseMoveEventHandler]);
const handlerEnterQuery = enterQuery(handlerQuery);
const handlerExitQuery = exitQuery(handlerQuery);
const listenerQuery = defineQuery([MouseMoveEventListener]);
const eventQuery = defineQuery([MouseMoveEvent]);

const addEvent = (world: IWorld, eid: number, x: number, y: number): void => {
  if (!hasComponent(world, MouseMoveEvent, eid)) {
    addComponent(world, MouseMoveEvent, eid);
    MouseMoveEventProxy.get(eid).allocate();
  }
  MouseMoveEventProxy.get(eid).add(x, y);
};

export const mouseMoveEventHandleSystem = (world: IWorld) => {
  handlerExitQuery(world).forEach(eid => {
    const proxy = MouseMoveEventHandlerProxy.get(eid);

    if (proxy.listenersAlive) {
      const target = proxy.target;
      target.removeEventListener('mousemove', proxy.listener);
    }

    if (hasComponent(world, MouseMoveEventHandlerReady, eid)) {
      removeComponent(world, MouseMoveEventHandlerReady, eid);
    }

    proxy.free();
  });

  handlerEnterQuery(world).forEach(eid => {
    const proxy = MouseMoveEventHandlerProxy.get(eid);
    const target = proxy.target;

    const listener = (event: MouseEvent): void => {
      listenerQuery(world).forEach(eid => {
        addEvent(
          world,
          eid,
          (event.offsetX / target.clientWidth) * 2.0 - 1.0,
          -((event.offsetY / target.clientHeight) * 2.0 - 1.0)
        );
      });
    };

    target.addEventListener('mousemove', listener);
    MouseMoveEventHandlerProxy.get(eid).allocate(listener);
    addComponent(world, MouseMoveEventHandlerReady, eid);
  });
};

export const mouseMoveEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    MouseMoveEventProxy.get(eid).free();
    removeComponent(world, MouseMoveEvent, eid);
  });
};
