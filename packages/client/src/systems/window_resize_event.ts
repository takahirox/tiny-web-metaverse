import {
  addComponent,
  defineQuery,
  enterQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  WindowResizeEvent,
  WindowResizeEventHandler,
  WindowResizeEventHandlerDestroy,
  WindowResizeEventHandlerInit,
  WindowResizeEventHandlerProxy,
  WindowResizeEventListener
} from "../components/window_resize";

const initEnterQuery = enterQuery(defineQuery([WindowResizeEventHandlerInit]));
const destroyEnterQuery = enterQuery(defineQuery(
  [WindowResizeEventHandler, WindowResizeEventHandlerDestroy]));
const listenerQuery = defineQuery([WindowResizeEventListener]);
const eventQuery = defineQuery([WindowResizeEvent]);

export const windowResizeEventHandleSystem = (world: IWorld) => {
  destroyEnterQuery(world).forEach(eid => {
    removeComponent(world, WindowResizeEventHandlerDestroy, eid);

    const proxy = WindowResizeEventHandlerProxy.get(eid);
    window.removeEventListener('resize', proxy.listener);
    proxy.free(world);
  });

  initEnterQuery(world).forEach(eid => {
    removeComponent(world, WindowResizeEventHandlerInit, eid);

    const listener = () => {
      listenerQuery(world).forEach(eid => {
        addComponent(world, WindowResizeEvent, eid);
      });
    };
    window.addEventListener('resize', listener);
    WindowResizeEventHandlerProxy.get(eid).allocate(world, listener);
  });
};

export const windowResizeEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    removeComponent(world, WindowResizeEvent, eid);
  });
};
