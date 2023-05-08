import {
  defineQuery,
  enterQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  MouseButtonEvent,
  MouseButtonEventHandler,
  MouseButtonEventHandlerDestroy,
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

const initEnterQuery = enterQuery(defineQuery([MouseButtonEventHandlerInit]));
const destroyEnterQuery = enterQuery(defineQuery(
  [MouseButtonEventHandler, MouseButtonEventHandlerDestroy]));
const listenerQuery = defineQuery([MouseButtonEventListener]);
const eventQuery = defineQuery([MouseButtonEvent]);

const addMouseButtonEvent = (
  world: IWorld,
  eid: number,
  type: MouseButtonEventType,
  event: MouseEvent
): void => {
  // TODO: Use canvas, not document.body?
  MouseButtonEventProxy.get(eid).add(
    world,
    type,
    MouseButtonTypeTable[event.button],
    (event.offsetX / document.body.clientWidth) * 2.0 - 1.0,
    (event.offsetY / document.body.clientHeight) * 2.0 - 1.0
  );
}

export const mouseButtonEventHandleSystem = (world: IWorld) => {
  destroyEnterQuery(world).forEach(eid => {
    removeComponent(world, MouseButtonEventHandlerDestroy, eid);

    const proxy = MouseButtonEventHandlerProxy.get(eid);

    // TODO: Not document but canvas?
    document.removeEventListener('mousedown', proxy.mousedownListener);
    document.removeEventListener('mouseup', proxy.mouseupListener);

    proxy.free(world);
  });

  initEnterQuery(world).forEach(eid => {
    removeComponent(world, MouseButtonEventHandlerInit, eid);

    // TODO: Use canvas, not document.body?

    const mousedownListener = (event: MouseEvent): void => {
      listenerQuery(world).forEach(eid => {
        addMouseButtonEvent(world, eid, MouseButtonEventType.Down, event);
      });
    };

    const mouseupListener = (event: MouseEvent): void => {
      listenerQuery(world).forEach(eid => {
        addMouseButtonEvent(world, eid, MouseButtonEventType.Up, event);
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

export const mouseButtonEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    MouseButtonEventProxy.get(eid).free(world);
  });
};
