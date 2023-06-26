import {
  defineQuery,
  enterQuery,
  IWorld,
  removeComponent
} from "bitecs";
import { WebGLRenderer } from "three";
import {
  RendererDestroy,
  RendererInit,
  RendererInitProxy,
  RendererProxy,
  Renderer
} from "../components/renderer";
import {
  WindowResizeEvent,
  WindowSize
} from "../components/window_resize";

const initEnterQuery = enterQuery(defineQuery([RendererInit]));
const destroyEnterQuery = enterQuery(defineQuery([Renderer, RendererDestroy]));
const rendererWindowResizeEnterQuery =
  enterQuery(defineQuery([Renderer, WindowResizeEvent, WindowSize]));

export const rendererSystem = (world: IWorld): void => {
  destroyEnterQuery(world).forEach(eid => {
    removeComponent(world, RendererDestroy, eid);

    const proxy = RendererProxy.get(eid);
    proxy.renderer.dispose();
    proxy.free(world);
  });

  initEnterQuery(world).forEach(eid => {
    const initProxy = RendererInitProxy.get(eid);
    const canvas = initProxy.canvas;
    const width = initProxy.width;
    const height = initProxy.height;
    const pixelRatio = initProxy.pixelRatio;
    initProxy.free(world);

    // TODO: Configurable renderer parameters
    const renderer = new WebGLRenderer({antialias: true, canvas});
    renderer.setSize(width, height);
    renderer.setPixelRatio(pixelRatio);

    const proxy = RendererProxy.get(eid);
    proxy.allocate(world, renderer);
  });

  rendererWindowResizeEnterQuery(world).forEach(eid => {
    const renderer = RendererProxy.get(eid).renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};
