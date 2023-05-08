import {
  defineQuery,
  enterQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  KeyEvent,
  KeyEventHandler,
  KeyEventHandlerDestroy,
  KeyEventHandlerInit,
  KeyEventHandlerProxy,
  KeyEventListener,
  KeyEventProxy,
  KeyEventType
} from "../components/keyboard";

const initEnterQuery = enterQuery(defineQuery([KeyEventHandlerInit]));
const destroyEnterQuery = enterQuery(defineQuery([KeyEventHandler, KeyEventHandlerDestroy]));
const listenerQuery = defineQuery([KeyEventListener]);
const eventQuery = defineQuery([KeyEvent]);

export const keyEventHandleSystem = (world: IWorld) => {
  destroyEnterQuery(world).forEach(eid => {
    removeComponent(world, KeyEventHandlerDestroy, eid);

    const proxy = KeyEventHandlerProxy.get(eid);

    document.removeEventListener('keydown', proxy.keydownListener);
    document.removeEventListener('keyup', proxy.keyupListener);

    proxy.free(world);
  });

  initEnterQuery(world).forEach(eid => {
    removeComponent(world, KeyEventHandlerInit, eid);

    const keydownListener = (event: KeyboardEvent): void => {
      listenerQuery(world).forEach(eid => {
        KeyEventProxy.get(eid).add(world, KeyEventType.Down, event.keyCode);
      });
    };

    const keyupListener = (event: KeyboardEvent): void => {
      listenerQuery(world).forEach(eid => {
        KeyEventProxy.get(eid).add(world, KeyEventType.Up, event.keyCode);
      });
    };

    document.addEventListener('keydown', keydownListener);
    document.addEventListener('keyup', keyupListener);

    KeyEventHandlerProxy.get(eid).allocate(
      world,
      keydownListener,
      keyupListener
    );
  });
};

export const keyEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    KeyEventProxy.get(eid).free(world);
  });
};
