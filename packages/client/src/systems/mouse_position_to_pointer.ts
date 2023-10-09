import {
  defineQuery,
  IWorld
} from "bitecs";
import {
  MouseMoveEvent,
  MouseMoveEventProxy,
  MousePosition
} from "../components/mouse";
import { Pointer, PointerProxy } from "../components/pointer";

const positionQuery = defineQuery([MousePosition, MouseMoveEvent]);
const pointerQuery = defineQuery([Pointer]);

export const mousePositionToPointerSystem = (world: IWorld) => {
  positionQuery(world).forEach(eid => {
    for (const e of MouseMoveEventProxy.get(eid).events) {
      pointerQuery(world).forEach(pointerEid => {
        const pointerProxy = PointerProxy.get(pointerEid);
        pointerProxy.update(e.x, e.y);
      });
    }
  });
};