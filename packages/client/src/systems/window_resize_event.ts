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
  WindowResizeEvent,
  WindowResizeEventHandler,
  WindowResizeEventHandlerProxy,
  WindowResizeEventHandlerReady,
  WindowResizeEventListener
} from "../components/window_resize";

const handlerQuery = defineQuery([WindowResizeEventHandler]);
const handlerEnterQuery = enterQuery(handlerQuery);
const handlerExitQuery = exitQuery(handlerQuery);

const listenerQuery = defineQuery([WindowResizeEventListener]);
const eventQuery = defineQuery([WindowResizeEvent]);

export const windowResizeEventHandleSystem = (world: IWorld) => {
  handlerExitQuery(world).forEach(eid => {
    const proxy = WindowResizeEventHandlerProxy.get(eid);

    if (proxy.alive) {
      window.removeEventListener('resize', proxy.listener);
    }

    if (hasComponent(world, WindowResizeEventHandlerReady, eid)) {
      removeComponent(world, WindowResizeEventHandlerReady, eid);
    }

    proxy.free();
  });

  handlerEnterQuery(world).forEach(eid => {
    const listener = () => {
      listenerQuery(world).forEach(eid => {
        addComponent(world, WindowResizeEvent, eid);
      });
    };
    window.addEventListener('resize', listener);
    WindowResizeEventHandlerProxy.get(eid).allocate(listener);
    addComponent(world, WindowResizeEventHandlerReady, eid);
  });
};

export const windowResizeEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    WindowResizeEventHandlerProxy.get(eid).free();
    removeComponent(world, WindowResizeEvent, eid);
  });
};
