import { defineQuery, exitQuery, IWorld } from "bitecs";
import { Canvas, CanvasProxy } from "../components/canvas";

const canvasExitQuery = exitQuery(defineQuery([Canvas]));

export const canvasSystem = (world: IWorld): void => {
  canvasExitQuery(world).forEach(eid => {
    CanvasProxy.get(eid).free(); 
  });
};
