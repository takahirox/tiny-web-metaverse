import {
  addComponent,
  defineQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  WindowResizeEvent,
  WindowResizeEventListener
} from "../components/window_resize";

const listenerQuery = defineQuery([WindowResizeEventListener]);
export const listenWindowResizeEvent = (world: IWorld) => {
  window.addEventListener('resize', () => {
    listenerQuery(world).forEach(eid => {
      addComponent(world, WindowResizeEvent, eid);
    });
  });
};

const eventQuery = defineQuery([WindowResizeEvent]);
export const windowResizeEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    removeComponent(world, WindowResizeEvent, eid);
  });
};
