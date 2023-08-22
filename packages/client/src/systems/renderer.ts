import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld
} from "bitecs";
import {
  Renderer,
  RendererProxy
} from "../components/renderer";
import {
  WindowResizeEvent,
  WindowSize
} from "../components/window_resize";

const rendererExitQuery = exitQuery(defineQuery([Renderer]));
const rendererWindowResizeEnterQuery =
  enterQuery(defineQuery([Renderer, WindowResizeEvent, WindowSize]));

export const rendererSystem = (world: IWorld): void => {
  rendererExitQuery(world).forEach(eid => {
    const proxy = RendererProxy.get(eid);
    proxy.renderer.dispose();
    proxy.free();
  });

  rendererWindowResizeEnterQuery(world).forEach(eid => {
    const renderer = RendererProxy.get(eid).renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};
