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
  KeyEvent,
  KeyEventHandler,
  KeyEventHandlerReady,
  KeyEventHandlerProxy,
  KeyEventListener,
  KeyEventProxy,
  KeyEventType
} from "../components/keyboard";

const handlerQuery = defineQuery([KeyEventHandler]);
const handlerEnterQuery = enterQuery(handlerQuery);
const handlerExitQuery = exitQuery(handlerQuery);
const listenerQuery = defineQuery([KeyEventListener]);
const eventQuery = defineQuery([KeyEvent]);

const addEvent = (world: IWorld, eid: number, type: KeyEventType, code: number): void => {
  if (!hasComponent(world, KeyEvent, eid)) {
    addComponent(world, KeyEvent, eid);
    KeyEventProxy.get(eid).allocate();
  }
  KeyEventProxy.get(eid).add(type, code);
};

export const keyEventHandleSystem = (world: IWorld) => {
  handlerExitQuery(world).forEach(eid => {
    if (!hasComponent(world, KeyEventHandlerReady, eid)) {
      return;
    }

    const proxy = KeyEventHandlerProxy.get(eid);

    document.removeEventListener('keydown', proxy.keydownListener);
    document.removeEventListener('keyup', proxy.keyupListener);

    proxy.free();
  });

  handlerEnterQuery(world).forEach(eid => {
    const keydownListener = (event: KeyboardEvent): void => {
      listenerQuery(world).forEach(eid => {
        addEvent(world, eid, KeyEventType.Down, event.keyCode);
      });
    };

    const keyupListener = (event: KeyboardEvent): void => {
      listenerQuery(world).forEach(eid => {
        addEvent(world, eid, KeyEventType.Up, event.keyCode);
      });
    };

    document.addEventListener('keydown', keydownListener);
    document.addEventListener('keyup', keyupListener);

    KeyEventHandlerProxy.get(eid).allocate(
      keydownListener,
      keyupListener
    );

    addComponent(world, KeyEventHandlerReady, eid);
  });
};

export const keyEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    KeyEventProxy.get(eid).free();
    removeComponent(world, KeyEvent, eid);
  });
};
