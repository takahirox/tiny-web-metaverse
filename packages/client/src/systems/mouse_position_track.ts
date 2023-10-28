import { defineQuery, IWorld } from "bitecs";
import {
  CurrentMousePosition,
  MouseMoveEvent,
  MouseMoveEventProxy,
  MousePosition,
  MousePositionProxy
} from "../components/mouse";
import {
  getCurrentMousePositionProxy,
  getPreviousMousePositionProxy
} from "../utils/mouse";

// TODO: Should MousePosition entity and PreviousMousePosition entity
//       be different?
const currentQuery = defineQuery([CurrentMousePosition, MouseMoveEvent, MousePosition]);

export const mousePositionTrackSystem = (world: IWorld) => {
  const { x: currentX, y: currentY } = getCurrentMousePositionProxy(world);
  getPreviousMousePositionProxy(world).update(currentX, currentY);

  currentQuery(world).forEach(eid => {
    const mouseProxy = MousePositionProxy.get(eid);
    for (const e of MouseMoveEventProxy.get(eid).events) {
      mouseProxy.update(e.x, e.y);
    }
  });
};