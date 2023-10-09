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
  TouchEvent,
  TouchEventHandler,
  TouchEventHandlerProxy,
  TouchEventHandlerReady,
  TouchEventListener,
  TouchEventProxy,
  TouchEventType
} from "../components/touch";

const handlerQuery = defineQuery([TouchEventHandler]);
const handlerEnterQuery = enterQuery(handlerQuery);
const handlerExitQuery = exitQuery(handlerQuery);
const listenerQuery = defineQuery([TouchEventListener]);
const eventQuery = defineQuery([TouchEvent]);

const addTouchEvent = (
  world: IWorld,
  eid: number,
  type: TouchEventType,
  event: TouchEvent
): void => {
  if (!hasComponent(world, TouchEvent, eid)) {
    addComponent(world, TouchEvent, eid);
    TouchEventProxy.get(eid).allocate();
  }

  // TODO: Implement properly
  if (type === TouchEventType.Start) {
    // TODO: Support multiple touches
    const touch = event.touches[0];

    // TODO: Use canvas, not document.body?
    // TODO: Is using pageX/Y correct?
    TouchEventProxy.get(eid).add(
      type,
      (touch.pageX / document.body.clientWidth) * 2.0 - 1.0,
      -((touch.pageY / document.body.clientHeight) * 2.0 - 1.0)
    );
  } else {
    // TODO: Fix me. Setting x/y = 0/0 as dummy for now.
    //       What values should be passed?
    TouchEventProxy.get(eid).add(type, 0, 0);
  }
}

export const touchEventHandleSystem = (world: IWorld) => {
  handlerExitQuery(world).forEach(eid => {
    const proxy = TouchEventHandlerProxy.get(eid);

    if (proxy.listenersAlive) {
      const target = proxy.target;

      target.removeEventListener('touchstart', proxy.touchstartListener);
      target.removeEventListener('touchend', proxy.touchendListener);
      target.removeEventListener('touchcancel', proxy.touchcancelListener);
    }

    if (hasComponent(world, TouchEventHandlerReady, eid)) {
      removeComponent(world, TouchEventHandlerReady, eid);
    }

    proxy.free();
  });

  handlerEnterQuery(world).forEach(eid => {
    const proxy = TouchEventHandlerProxy.get(eid);

    const touchstartListener = (event: TouchEvent): void => {
      // TODO: May need to check world is still alive?
      listenerQuery(world).forEach(eid => {
        addTouchEvent(world, eid, TouchEventType.Start, event);
      });
    };

    // TODO: Should we fire up event if the window is unfocused
    //       while holding mouse buttons?

    const touchendListener = (event: TouchEvent): void => {
      listenerQuery(world).forEach(eid => {
        addTouchEvent(world, eid, TouchEventType.End, event);
      });
    };

    const touchcancelListener = (event: TouchEvent): void => {
      listenerQuery(world).forEach(eid => {
        addTouchEvent(world, eid, TouchEventType.Cancel, event);
      });
    };

    const target = proxy.target;

    target.addEventListener('touchstart', touchstartListener);
    target.addEventListener('touchend', touchendListener);
    target.addEventListener('touchcancel', touchcancelListener);

    TouchEventHandlerProxy.get(eid).allocate(
      touchstartListener,
      touchendListener,
      touchcancelListener
    );

    addComponent(world, TouchEventHandlerReady, eid);
  });
};

export const touchEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    TouchEventProxy.get(eid).free();
    removeComponent(world, TouchEvent, eid);
  });
};
