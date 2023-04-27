import {
  defineQuery,
  exitQuery,
  IWorld
} from "bitecs";
import {
  Renderer,
  RendererProxy
} from "../components/renderer";

const rendererExitQuery = exitQuery(defineQuery([Renderer]));

export const rendererSystem = (world: IWorld): void => {
  rendererExitQuery(world).forEach(eid => {
    const proxy = RendererProxy.get(eid);
    proxy.renderer.dispose();
    proxy.free();
  });
};
