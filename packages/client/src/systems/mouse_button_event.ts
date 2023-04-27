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
  MouseButtonEvent,
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

const addEvent = (
  world: IWorld,
  eid: number,
  type: MouseButtonEventType,
  button: MouseButtonType,
  x: number,
  y: number
): void => {
  if (!hasComponent(world, MouseButtonEvent, eid)) {
    addComponent(world, MouseButtonEvent, eid);
    MouseButtonEventProxy.get(eid).allocate();
  }

  MouseButtonEventProxy.get(eid).add(type, button, x, y);
}

const eventQueue: {
  type: MouseButtonEventType,
  button: MouseButtonType,
  x: number,
  y: number
}[] = [];

const addToQueue = (type: MouseButtonEventType, event: MouseEvent): void => {
  // Avoid cast if possible
  const canvas = event.target as HTMLCanvasElement;
  eventQueue.push({
    type,
    button: MouseButtonTypeTable[event.button],
    x: (event.offsetX / canvas.clientWidth) * 2.0 - 1.0,
    y: -((event.offsetY / canvas.clientHeight) * 2.0 - 1.0)
  });
};

const onMouseDown = (event: MouseEvent): void => {
  addToQueue(MouseButtonEventType.Down, event);
};

// TODO: Should we fire up event if the window is unfocused
//       while holding mouse buttons?

const onMouseUp = (event: MouseEvent): void => {
  addToQueue(MouseButtonEventType.Up, event);
};

const onContextMenu = (event: MouseEvent): void => {
  event.preventDefault();
};

const canvasQuery = defineQuery([Canvas]);
const enterCanvasQuery = enterQuery(canvasQuery);
const exitCanvasQuery = exitQuery(canvasQuery);
const listenerQuery = defineQuery([MouseButtonEventListener]);
const eventQuery = defineQuery([MouseButtonEvent]);

export const mouseButtonEventHandleSystem = (world: IWorld) => {
  // Assumes up to only one canvas entity

  exitCanvasQuery(world).forEach(eid => {
    const element = CanvasProxy.get(eid).canvas;
    element.removeEventListener('mousedown', onMouseDown);
    element.removeEventListener('mouseup', onMouseUp);
    element.removeEventListener('contextmenu', onContextMenu);
  });

  enterCanvasQuery(world).forEach(eid => {
    const element = CanvasProxy.get(eid).canvas;
    element.addEventListener('mousedown', onMouseDown);
    element.addEventListener('mouseup', onMouseUp);
    element.addEventListener('contextmenu', onContextMenu);
  });

  for (const e of eventQueue) {
    listenerQuery(world).forEach(eid => {
      addEvent(world, eid, e.type, e.button, e.x, e.y);
    });
  }

  eventQueue.length = 0;
};

export const mouseButtonEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    const proxy = MouseButtonEventProxy.get(eid);
    proxy.events.length = 0;
    proxy.free();
    removeComponent(world, MouseButtonEvent, eid);
  });
};
