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
  MouseMoveEvent,
  MouseMoveEventListener,
  MouseMoveEventProxy
} from "../components/mouse";

const addEvent = (world: IWorld, eid: number, x: number, y: number): void => {
  if (!hasComponent(world, MouseMoveEvent, eid)) {
    addComponent(world, MouseMoveEvent, eid);
    MouseMoveEventProxy.get(eid).allocate();
  }
  MouseMoveEventProxy.get(eid).add(x, y);
};

const eventQueue: { x: number, y: number }[] = [];

const onMouseMove = (event: MouseEvent): void => {
  // TODO: Avoid cast if possible
  const canvas = event.target as HTMLCanvasElement;
  eventQueue.push({
    x: (event.offsetX / canvas.clientWidth) * 2.0 - 1.0,
    y: -((event.offsetY / canvas.clientHeight) * 2.0 - 1.0)
  });
};

const canvasQuery = defineQuery([Canvas]);
const enterCanvasQuery = enterQuery(canvasQuery);
const exitCanvasQuery = exitQuery(canvasQuery);
const listenerQuery = defineQuery([MouseMoveEventListener]);
const eventQuery = defineQuery([MouseMoveEvent]);

export const mouseMoveEventHandleSystem = (world: IWorld) => {
  // Assumes up to only one canvas entity

  exitCanvasQuery(world).forEach(eid => {
    const canvas = CanvasProxy.get(eid).canvas;
    canvas.removeEventListener('mousemove', onMouseMove);
  });

  enterCanvasQuery(world).forEach(eid => {
    const canvas = CanvasProxy.get(eid).canvas;
    canvas.addEventListener('mousemove', onMouseMove);
  });

  for (const e of eventQueue) {
    listenerQuery(world).forEach(eid => {
      addEvent(world, eid, e.x, e.y);
    });
  }

  eventQueue.length = 0;
};

export const mouseMoveEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    const proxy = MouseMoveEventProxy.get(eid);
    proxy.events.length = 0;
    proxy.free();
    removeComponent(world, MouseMoveEvent, eid);
  });
};
