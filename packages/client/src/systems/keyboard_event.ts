import {
  addComponent,
  defineQuery,
  enterQuery,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import {
  KeyEvent,
  KeyEventListener,
  KeyEventProxy,
  KeyEventType
} from "../components/keyboard";
import { NullComponent } from "../components/null"

const addEvent = (world: IWorld, eid: number, type: KeyEventType, code: number): void => {
  if (!hasComponent(world, KeyEvent, eid)) {
    addComponent(world, KeyEvent, eid);
    KeyEventProxy.get(eid).allocate();
  }
  KeyEventProxy.get(eid).add(type, code);
};

const eventQueue: { keyCode: number, type: KeyEventType }[] = [];

const onKeyDown = (event: KeyboardEvent): void => {
  eventQueue.push({ keyCode: event.keyCode, type: KeyEventType.Down });
};

const onKeyUp = (event: KeyboardEvent): void => {
  eventQueue.push({ keyCode: event.keyCode, type: KeyEventType.Up });
};

// Trick to execute only in the first system run
const initialQuery = enterQuery(defineQuery([NullComponent]));

const listenerQuery = defineQuery([KeyEventListener]);
const eventQuery = defineQuery([KeyEvent]);

export const keyEventHandleSystem = (world: IWorld) => {
  initialQuery(world).forEach(() => {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
  });

  for (const e of eventQueue) {
    listenerQuery(world).forEach(eid => {
      addEvent(world, eid, e.type, e.keyCode);
    });
  }

  eventQueue.length = 0;
};

export const keyEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    const proxy = KeyEventProxy.get(eid)
    proxy.events.length = 0;
    proxy.free();
    removeComponent(world, KeyEvent, eid);
  });
};
