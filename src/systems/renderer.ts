import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld
} from "bitecs";
import { WebGLRenderer } from "three";
import {
  RendererInit,
  RendererInitProxy,
  RendererProxy,
  Renderer
} from "../components/renderer";
import {
  WindowResizeEvent,
  WindowSize
} from "../components/window_resize";

const initializeEnterQuery = enterQuery(defineQuery([RendererInit]));
const rendererExitQuery = exitQuery(defineQuery([Renderer]));
const rendererWindowResizeEnterQuery =
  enterQuery(defineQuery([Renderer, WindowResizeEvent, WindowSize]));

export const rendererSystem = (world: IWorld): void => {
  initializeEnterQuery(world).forEach(eid => {
    const initProxy = RendererInitProxy.get(eid);
    const parentElement = initProxy.parentDomElement;
    const width = initProxy.width;
    const height = initProxy.height;
    const pixelRatio = initProxy.pixelRatio;
    initProxy.free(world);

    const renderer = new WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setPixelRatio(pixelRatio);
    parentElement.appendChild(renderer.domElement);

    const proxy = RendererProxy.get(eid);
    proxy.allocate(world, renderer);
  });

  rendererExitQuery(world).forEach(eid => {
    const proxy = RendererProxy.get(eid);
    proxy.renderer.dispose();
    proxy.free(world);
  });

  rendererWindowResizeEnterQuery(world).forEach(eid => {
    const renderer = RendererProxy.get(eid).renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};
