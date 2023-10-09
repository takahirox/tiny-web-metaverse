import {
  defineQuery,
  IWorld
} from "bitecs";
import {
  TouchMoveEvent,
  TouchMoveEventProxy,
  TouchPosition,
  TouchPositionProxy
} from "../components/touch";

const positionQuery = defineQuery([TouchPosition, TouchMoveEvent]);

export const touchPositionTrackSystem = (world: IWorld) => {
  positionQuery(world).forEach(eid => {
    const positionProxy = TouchPositionProxy.get(eid);
    for (const e of TouchMoveEventProxy.get(eid).events) {
      positionProxy.update(e.x, e.y);
    }
  });
};