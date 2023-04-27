import {
  defineQuery,
  IWorld
} from "bitecs";
import {
  TouchEvent,
  TouchEventProxy,
  TouchEventType,
  TouchMoveEvent,
  TouchMoveEventProxy,
  TouchPosition
} from "../components/touch";
import { Pointer, PointerProxy } from "../components/pointer";

const touchQuery = defineQuery([TouchPosition, TouchEvent]);
const moveQuery = defineQuery([TouchPosition, TouchMoveEvent]);
const pointerQuery = defineQuery([Pointer]);

export const touchPositionToPointerSystem = (world: IWorld) => {
  touchQuery(world).forEach(eid => {
    for (const e of TouchEventProxy.get(eid).events) {
      if (e.type !== TouchEventType.Start) {
        continue;
      }
      pointerQuery(world).forEach(pointerEid => {
        const pointerProxy = PointerProxy.get(pointerEid);
        pointerProxy.update(e.x, e.y);
      });
    }
  });

  moveQuery(world).forEach(eid => {
    for (const e of TouchMoveEventProxy.get(eid).events) {
      pointerQuery(world).forEach(pointerEid => {
        const pointerProxy = PointerProxy.get(pointerEid);
        pointerProxy.update(e.x, e.y);
      });
    }
  });
};