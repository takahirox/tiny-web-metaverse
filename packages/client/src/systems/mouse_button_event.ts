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
  MouseButtonEvent,
  MouseButtonEventHandler,
  MouseButtonEventHandlerProxy,
  MouseButtonEventHandlerReady,
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

const handlerQuery = defineQuery([MouseButtonEventHandler]);
const handlerEnterQuery = enterQuery(handlerQuery);
const handlerExitQuery = exitQuery(handlerQuery);
const listenerQuery = defineQuery([MouseButtonEventListener]);
const eventQuery = defineQuery([MouseButtonEvent]);

const addMouseButtonEvent = (
  world: IWorld,
  eid: number,
  type: MouseButtonEventType,
  event: MouseEvent
): void => {
  if (!hasComponent(world, MouseButtonEvent, eid)) {
    addComponent(world, MouseButtonEvent, eid);
    MouseButtonEventProxy.get(eid).allocate();
  }

  // TODO: Use canvas, not document.body?
  MouseButtonEventProxy.get(eid).add(
    type,
    MouseButtonTypeTable[event.button],
    (event.offsetX / document.body.clientWidth) * 2.0 - 1.0,
    -((event.offsetY / document.body.clientHeight) * 2.0 - 1.0)
  );
}

export const mouseButtonEventHandleSystem = (world: IWorld) => {
  handlerExitQuery(world).forEach(eid => {
    const proxy = MouseButtonEventHandlerProxy.get(eid);

    if (proxy.listenersAlive) {
      const target = proxy.target;

      target.removeEventListener('mousedown', proxy.mousedownListener);
      target.removeEventListener('mouseup', proxy.mouseupListener);
      target.removeEventListener('contextmenu', proxy.contextmenuListener);
    }

    if (hasComponent(world, MouseButtonEventHandlerReady, eid)) {
      removeComponent(world, MouseButtonEventHandlerReady, eid);
    }

    proxy.free();
  });

  handlerEnterQuery(world).forEach(eid => {
    const proxy = MouseButtonEventHandlerProxy.get(eid);

    const mousedownListener = (event: MouseEvent): void => {
      // TODO: May need to check world is still alive?
      listenerQuery(world).forEach(eid => {
        addMouseButtonEvent(world, eid, MouseButtonEventType.Down, event);
      });
    };

    const mouseupListener = (event: MouseEvent): void => {
      listenerQuery(world).forEach(eid => {
        addMouseButtonEvent(world, eid, MouseButtonEventType.Up, event);
      });
    };

    const contextmenuListener = (event: MouseEvent): void => {
      event.preventDefault();
    };

    const target = proxy.target;

    target.addEventListener('mousedown', mousedownListener);
    target.addEventListener('mouseup', mouseupListener);
    target.addEventListener('contextmenu', contextmenuListener);

    MouseButtonEventHandlerProxy.get(eid).allocate(
      mousedownListener,
      mouseupListener,
      contextmenuListener
    );

    addComponent(world, MouseButtonEventHandlerReady, eid);
  });
};

export const mouseButtonEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    MouseButtonEventProxy.get(eid).free();
    removeComponent(world, MouseButtonEvent, eid);
  });
};
