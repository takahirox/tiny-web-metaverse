import {
  defineQuery,
  hasComponent,
  IWorld
} from "bitecs";
import {
  MouseMoveEvent,
  MouseMoveEventProxy,
  MousePosition,
  MousePositionProxy,
  PreviousMousePosition,
  PreviousMousePositionProxy
} from "../components/mouse";

// TODO: Should MousePosition entity and PreviousMousePosition entity
//       be different?
const positionQuery = defineQuery([MousePosition, PreviousMousePosition]);

export const mousePositionTrackSystem = (world: IWorld) => {
  positionQuery(world).forEach(eid => {
    const mouseProxy = MousePositionProxy.get(eid);
    const previousProxy = PreviousMousePositionProxy.get(eid);

    previousProxy.update(mouseProxy.x, mouseProxy.y);

    if (hasComponent(world, MouseMoveEvent, eid)) {
      for (const e of MouseMoveEventProxy.get(eid).events) {
        mouseProxy.update(e.x, e.y);
      }
    }
  });
};