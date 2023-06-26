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
  MouseMoveEventHandlerInitProxy,
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
    const target = proxy.target;

    target.removeEventListener('mousemove', proxy.listener);

    proxy.free(world);
  });

  initEnterQuery(world).forEach(eid => {
    const proxy = MouseMoveEventHandlerInitProxy.get(eid);
    const target = proxy.target;
    proxy.free(world);

    const listener = (event: MouseEvent): void => {
      listenerQuery(world).forEach(eid => {
        MouseMoveEventProxy.get(eid).add(
          world,
          (event.offsetX / target.clientWidth) * 2.0 - 1.0,
          -((event.offsetY / target.clientHeight) * 2.0 - 1.0)
        );
      });
    };

    target.addEventListener('mousemove', listener);

    MouseMoveEventHandlerProxy.get(eid).allocate(
      world,
      target,
      listener
    );
  });
};

export const mouseMoveEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    MouseMoveEventProxy.get(eid).free(world);
  });
};
