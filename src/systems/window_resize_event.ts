import {
  addComponent,
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  WindowResizeEvent,
  WindowResizeEventHandler,
  WindowResizeEventHandlerInit,
  WindowResizeEventHandlerProxy,
  WindowResizeEventListener
} from "../components/window_resize";

const handlerInitEnterQuery = enterQuery(defineQuery([WindowResizeEventHandlerInit]));
const handlerExitQuery = exitQuery(defineQuery([WindowResizeEventHandler]));
const listenerQuery = defineQuery([WindowResizeEventListener]);
const eventQuery = defineQuery([WindowResizeEvent]);

export const windowResizeEventHandleSystem = (world: IWorld) => {
  handlerExitQuery(world).forEach(eid => {
    const proxy = WindowResizeEventHandlerProxy.get(eid);
    window.removeEventListener('resize', proxy.listener);
    proxy.free(world);
  });

  handlerInitEnterQuery(world).forEach(eid => {
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
