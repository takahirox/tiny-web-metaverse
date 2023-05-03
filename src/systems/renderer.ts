import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld
} from "bitecs";
import { WebGLRenderer } from "three";
import {
  RendererInitialize,
  RendererInitializeProxy,
  RendererProxy,
  Renderer
} from "../components/renderer";

const initializeQuery = defineQuery([RendererInitialize]);
const initializeEnterQuery = enterQuery(initializeQuery);

const rendererQuery = defineQuery([Renderer]);
const rendererExitQuery = exitQuery(rendererQuery);

export const rendererSystem = (world: IWorld): void => {
  initializeEnterQuery(world).forEach(eid => {
    const initProxy = RendererInitializeProxy.get(eid);
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
};
