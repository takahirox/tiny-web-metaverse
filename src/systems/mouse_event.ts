import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  MouseButtonEvent,
  MouseButtonEventHandler,
  MouseButtonEventHandlerInit,
  MouseButtonEventHandlerProxy,
  MouseButtonEventListener,
  MouseButtonEventProxy,
  MouseButtonEventType,
  MouseButtonType
} from "../components/mouse";

const MouseButtonTypeTable: Record<number, MouseButtonType> = {
  0: MouseButtonType.Left,
  1: MouseButtonType.Middle,
  2: MouseButtonType.Right
};

const handlerInitEnterQuery = enterQuery(defineQuery([MouseButtonEventHandlerInit]));
const handlerExitQuery = exitQuery(defineQuery([MouseButtonEventHandler]));
const listenerQuery = defineQuery([MouseButtonEventListener]);
const eventQuery = defineQuery([MouseButtonEvent]);

export const mouseButtonEventHandleSystem = (world: IWorld) => {
  handlerExitQuery(world).forEach(eid => {
    const proxy = MouseButtonEventHandlerProxy.get(eid);

    document.removeEventListener('mousedown', proxy.mousedownListener);
    document.removeEventListener('mouseup', proxy.mouseupListener);

    proxy.free(world);
  });

  handlerInitEnterQuery(world).forEach(eid => {
    removeComponent(world, MouseButtonEventHandlerInit, eid);

    const mousedownListener = (event: MouseEvent): void => {
      listenerQuery(world).forEach(eid => {
        MouseButtonEventProxy.get(eid).add(
          world,
          MouseButtonEventType.Down,
          MouseButtonTypeTable[event.button],
          event.clientX,
          event.clientY
        );
      });
    };

    const mouseupListener = (event: MouseEvent): void => {
      listenerQuery(world).forEach(eid => {
        MouseButtonEventProxy.get(eid).add(
          world,
          MouseButtonEventType.Up,
          MouseButtonTypeTable[event.button],
          event.clientX,
          event.clientY
        );
      });
    };

    document.addEventListener('mousedown', mousedownListener);
    document.addEventListener('mouseup', mouseupListener);

    MouseButtonEventHandlerProxy.get(eid).allocate(
      world,
      mousedownListener,
      mouseupListener
    );
  });
};

export const listenMouseButtonEvents = (world: IWorld) => {
  document.addEventListener('mousedown', (event) => {
    listenerQuery(world).forEach(eid => {
      MouseButtonEventProxy.get(eid).add(
        world,
        MouseButtonEventType.Down,
        MouseButtonTypeTable[event.button],
        event.clientX,
        event.clientY
      );
    });
  });

  document.addEventListener('mouseup', (event) => {
    listenerQuery(world).forEach(eid => {
      MouseButtonEventProxy.get(eid).add(
        world,
        MouseButtonEventType.Up,
        MouseButtonTypeTable[event.button],
        event.clientX,
        event.clientY
      );
    });
  });
};

export const mouseButtonEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    MouseButtonEventProxy.get(eid).free(world);
  });
};
