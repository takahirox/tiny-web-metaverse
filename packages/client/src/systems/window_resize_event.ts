import {
  addComponent,
  defineQuery,
  enterQuery,
  IWorld,
  removeComponent
} from "bitecs";
import { NullComponent } from "../components/null";
import {
  WindowResizeEvent,
  WindowResizeEventListener
} from "../components/window_resize";

const eventQueue: {}[] = [];

const onResize = (): void => {
  eventQueue.push({});
};

// Trick to execute only in the first system run
const initialQuery = enterQuery(defineQuery([NullComponent]));

const listenerQuery = defineQuery([WindowResizeEventListener]);
const eventQuery = defineQuery([WindowResizeEvent]);

export const windowResizeEventHandleSystem = (world: IWorld) => {
  initialQuery(world).forEach(() => {
    window.addEventListener('resize', onResize);
  });

  for (const _e of eventQueue) {
    listenerQuery(world).forEach(eid => {
      addComponent(world, WindowResizeEvent, eid);
    });
  }

  eventQueue.length = 0;
};

export const windowResizeEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    removeComponent(world, WindowResizeEvent, eid);
  });
};
