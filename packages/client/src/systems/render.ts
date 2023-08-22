import {
  defineQuery,
  IWorld,
} from "bitecs";
import {
  Renderer,
  RendererProxy
} from "../components/renderer";
import {
  SceneProxy,
  SceneTag
} from "../components/scene";
import {
  PerspectiveCameraTag,
  PerspectiveCameraProxy,
  SceneCamera
} from "../components/camera";

const rendererQuery = defineQuery([Renderer]);
const sceneQuery = defineQuery([SceneTag]);
const cameraQuery = defineQuery([PerspectiveCameraTag, SceneCamera]);

export const renderSystem = (world: IWorld): void => {
  const rendererEids = rendererQuery(world);
  const sceneEids = sceneQuery(world);
  const cameraEids = cameraQuery(world);

  rendererEids.forEach(rendererEid => {
    const renderer = RendererProxy.get(rendererEid).renderer;
    sceneEids.forEach(sceneEid => {
      const scene = SceneProxy.get(sceneEid).scene;
      cameraEids.forEach(cameraEid => {
        const camera = PerspectiveCameraProxy.get(cameraEid).camera;
        renderer.render(scene, camera);
      });
    });
  });
};
