import {
  defineQuery,
  IWorld
} from "bitecs";
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

const listenerQuery = defineQuery([MouseButtonEventListener]);
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

const eventQuery = defineQuery([MouseButtonEvent]);
export const mouseButtonEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    MouseButtonEventProxy.get(eid).free(world);
  });
};
