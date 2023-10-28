import { defineQuery, IWorld } from "bitecs";
import {
  CurrentMousePosition,
  MousePosition,
  MousePositionProxy,
  PreviousMousePosition
} from "../components/mouse";

const currentQuery = defineQuery([CurrentMousePosition, MousePosition]);
const previousQuery = defineQuery([PreviousMousePosition, MousePosition]);

// Note: Notice that the following two functions return MousePositionProxy.
//       You shouldn't hold two proxies at the same time.
//
// Bad:
// const currentProxy = getCurrentMousePositionProxy(world);
// const previousProxy = getPreviousMousePositionProxy(world);
//
//       Instead you can hold their values.
//
// Good:
// const { x: currentX, y: currentY } = getCurrentMousePositionProxy(world);
// const { x: previousX, y: previousY } = getPreviousMousePositionProxy(world);

export const getCurrentMousePositionProxy = (world: IWorld): MousePositionProxy => {
  // Assumes always single current mouse position entity
  return MousePositionProxy.get(currentQuery(world)[0]);
};

export const getPreviousMousePositionProxy = (world: IWorld): MousePositionProxy => {
  // Assumes always single current mouse position entity
  return MousePositionProxy.get(previousQuery(world)[0]);
};
