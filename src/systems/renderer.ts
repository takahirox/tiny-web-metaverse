import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld
} from "bitecs";
import { WebGLRenderer } from "three";
import {
  RendererInitialize,
  rendererInitializeProxy,
  rendererProxy,
  RendererTag
} from "../components/renderer";

const initializeQuery = defineQuery([RendererInitialize]);
const initializeEnterQuery = enterQuery(initializeQuery);

const rendererQuery = defineQuery([RendererTag]);
const rendererExitQuery = exitQuery(rendererQuery);

export const rendererSystem = (world: IWorld): void => {
  initializeEnterQuery(world).forEach(eid => {
    rendererInitializeProxy.eid = eid;
    const parentElement = rendererInitializeProxy.parentDomElement;
    const width = rendererInitializeProxy.width;
    const height = rendererInitializeProxy.height;
    const pixelRatio = rendererInitializeProxy.pixelRatio;
    rendererInitializeProxy.remove(world);

    const renderer = new WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setPixelRatio(pixelRatio);
    parentElement.appendChild(renderer.domElement);

    rendererProxy.eid = eid;
    rendererProxy.add(world, renderer);
  });

  rendererExitQuery(world).forEach(eid => {
    rendererProxy.eid = eid;
    rendererProxy.remove(world);
  });
};
