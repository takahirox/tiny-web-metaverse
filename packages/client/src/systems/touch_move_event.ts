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
  TouchMoveEvent,
  TouchMoveEventListener,
  TouchMoveEventProxy
} from "../components/touch";

const addEvent = (world: IWorld, eid: number, x: number, y: number): void => {
  if (!hasComponent(world, TouchMoveEvent, eid)) {
    addComponent(world, TouchMoveEvent, eid);
    TouchMoveEventProxy.get(eid).allocate();
  }
  TouchMoveEventProxy.get(eid).add(x, y);
};

const eventQueue: { x: number, y: number }[] = [];

const onTouchMove = (event: TouchEvent): void => {
  // TODO: Avoid cast if possible
  const canvas = event.target as HTMLCanvasElement;
  // TODO: Support multiple touches
  // TODO: Is using pageX/Y correct?
  const touch = event.touches[0];
  eventQueue.push({
    x: (touch.pageX / canvas.clientWidth) * 2.0 - 1.0,
    y: -((touch.pageY / canvas.clientHeight) * 2.0 - 1.0)
  });
};

const canvasQuery = defineQuery([Canvas]);
const enterCanvasQuery = enterQuery(canvasQuery);
const exitCanvasQuery = exitQuery(canvasQuery);
const listenerQuery = defineQuery([TouchMoveEventListener]);
const eventQuery = defineQuery([TouchMoveEvent]);

export const touchMoveEventHandleSystem = (world: IWorld) => {
  // Assumes up to only one canvas entity

  exitCanvasQuery(world).forEach(eid => {
    const canvas = CanvasProxy.get(eid).canvas;
    canvas.removeEventListener('touchmove', onTouchMove);
  });

  enterCanvasQuery(world).forEach(eid => {
    const canvas = CanvasProxy.get(eid).canvas;
    canvas.addEventListener('touchmove', onTouchMove);
  });

  for (const e of eventQueue) {
    listenerQuery(world).forEach(eid => {
      addEvent(world, eid, e.x, e.y);
    });
  }

  eventQueue.length = 0;
};

export const touchMoveEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    const proxy = TouchMoveEventProxy.get(eid);
    proxy.events.length = 0;
    proxy.free();
    removeComponent(world, TouchMoveEvent, eid);
  });
};
