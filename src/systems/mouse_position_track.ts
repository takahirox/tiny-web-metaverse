import {
  defineQuery,
  IWorld
} from "bitecs";
import {
  MouseMoveEvent,
  MouseMoveEventProxy,
  MousePosition,
  MousePositionProxy
} from "../components/mouse";

const positionQuery = defineQuery([MousePosition, MouseMoveEvent]);
export const mousePositionTrackSystem = (world: IWorld) => {
  positionQuery(world).forEach(eid => {
    for (const e of MouseMoveEventProxy.get(eid).events) {
      MousePositionProxy.get(eid).update(e.x, e.y);
    }
  });
};