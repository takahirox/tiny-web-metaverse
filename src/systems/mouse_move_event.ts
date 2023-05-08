import {
  defineQuery,
  enterQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  MouseMoveEvent,
  MouseMoveEventHandler,
  MouseMoveEventHandlerDestroy,
  MouseMoveEventHandlerInit,
  MouseMoveEventHandlerProxy,
  MouseMoveEventListener,
  MouseMoveEventProxy
} from "../components/mouse";

const initEnterQuery = enterQuery(defineQuery([MouseMoveEventHandlerInit]));
const destroyEnterQuery = enterQuery(defineQuery(
  [MouseMoveEventHandler, MouseMoveEventHandlerDestroy]));
const listenerQuery = defineQuery([MouseMoveEventListener]);
const eventQuery = defineQuery([MouseMoveEvent]);

export const mouseMoveEventHandleSystem = (world: IWorld) => {
  destroyEnterQuery(world).forEach(eid => {
    removeComponent(world, MouseMoveEventHandlerDestroy, eid);

    const proxy = MouseMoveEventHandlerProxy.get(eid);

    // TODO: Not document but canvas?
    document.removeEventListener('mousemove', proxy.listener);

    proxy.free(world);
  });

  initEnterQuery(world).forEach(eid => {
    removeComponent(world, MouseMoveEventHandlerInit, eid);

    // TODO: Use canvas, not document.body?

    const listener = (event: MouseEvent): void => {
      listenerQuery(world).forEach(eid => {
        MouseMoveEventProxy.get(eid).add(
          world,
          (event.offsetX / document.body.clientWidth) * 2.0 - 1.0,
          (event.offsetY / document.body.clientHeight) * 2.0 - 1.0
        );
      });
    };

    document.addEventListener('mousemove', listener);

    MouseMoveEventHandlerProxy.get(eid).allocate(
      world,
      listener
    );
  });
};

export const mouseMoveEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    MouseMoveEventProxy.get(eid).free(world);
  });
};
