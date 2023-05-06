import {
  defineQuery,
  IWorld
} from "bitecs";
import {
  KeyEvent,
  KeyEventListener,
  KeyEventProxy,
  KeyEventType
} from "../components/keyboard";

const listenerQuery = defineQuery([KeyEventListener]);
export const listenKeyEvents = (world: IWorld) => {
  document.addEventListener('keydown', (event) => {
    listenerQuery(world).forEach(eid => {
      KeyEventProxy.get(eid).add(world, KeyEventType.Down, event.keyCode);
    });
  });

  document.addEventListener('keyup', (event) => {
    listenerQuery(world).forEach(eid => {
      KeyEventProxy.get(eid).add(world, KeyEventType.Up, event.keyCode);
    });
  });
};

const eventQuery = defineQuery([KeyEvent]);
export const keyEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    KeyEventProxy.get(eid).free(world);
  });
};
