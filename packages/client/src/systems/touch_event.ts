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
  Canvas,
  CanvasProxy
} from "../components/canvas";
import {
  TouchEvent,
  TouchEventListener,
  TouchEventProxy,
  TouchEventType
} from "../components/touch";

const addEvent = (
  world: IWorld,
  eid: number,
  type: TouchEventType,
  x: number,
  y: number
): void => {
  if (!hasComponent(world, TouchEvent, eid)) {
    addComponent(world, TouchEvent, eid);
    TouchEventProxy.get(eid).allocate();
  }
  TouchEventProxy.get(eid).add(type, x, y);
}

const eventQueue: {
  type: TouchEventType,
  x: number,
  y: number
}[] = [];

const onTouchStart = (event: TouchEvent): void => {
  // TODO: Support multiple touches
  const touch = event.touches[0];
  const canvas = event.target as HTMLCanvasElement;

  // TODO: Is using pageX/Y correct?
  eventQueue.push({
    type: TouchEventType.Start,
    x: (touch.pageX / canvas.clientWidth) * 2.0 - 1.0,
    y: -((touch.pageY / canvas.clientHeight) * 2.0 - 1.0)
  });
};

// TODO: Should we fire up event if the window is unfocused
//       while holding mouse buttons?

const onTouchEnd = (): void => {
  // TODO: Fix me. Setting x/y = 0/0 as dummy for now.
  //       What values should be passed?
  eventQueue.push({ type: TouchEventType.End, x: 0, y: 0 });
};

const onTouchCancel = (): void => {
  // TODO: Same above.
  eventQueue.push({ type: TouchEventType.Cancel, x: 0, y: 0 });
};

const canvasQuery = defineQuery([Canvas]);
const enterCanvasQuery = enterQuery(canvasQuery);
const exitCanvasQuery = exitQuery(canvasQuery);
const listenerQuery = defineQuery([TouchEventListener]);
const eventQuery = defineQuery([TouchEvent]);

export const touchEventHandleSystem = (world: IWorld) => {
  // Assumes up to only one canvas entity

  exitCanvasQuery(world).forEach(eid => {
    const canvas = CanvasProxy.get(eid).canvas;
    canvas.removeEventListener('touchstart', onTouchStart);
    canvas.removeEventListener('touchend', onTouchEnd);
    canvas.removeEventListener('touchcancel', onTouchCancel);
  });

  enterCanvasQuery(world).forEach(eid => {
    const canvas = CanvasProxy.get(eid).canvas;
    canvas.addEventListener('touchstart', onTouchStart);
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('touchcancel', onTouchCancel);
  });

  for (const e of eventQueue) {
    listenerQuery(world).forEach(eid => {
      addEvent(world, eid, e.type, e.x, e.y);
    });
  }

  eventQueue.length = 0;
};

export const touchEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    const proxy = TouchEventProxy.get(eid);
    proxy.events.length = 0;
    proxy.free();
    removeComponent(world, TouchEvent, eid);
  });
};
