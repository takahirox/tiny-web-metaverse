import {
  defineQuery,
  IWorld,
} from "bitecs";
import {
  RendererProxy,
  Renderer
} from "../components/renderer";
import {
  SceneProxy,
  SceneTag
} from "../components/scene";
import {
  SceneCamera,
  SceneCameraProxy
} from "../components/scene_camera";

const rendererQuery = defineQuery([Renderer]);
const sceneQuery = defineQuery([SceneTag]);
const cameraQuery = defineQuery([SceneCamera]);

export const renderSystem = (world: IWorld): void => {
  const rendererEids = rendererQuery(world);
  const sceneEids = sceneQuery(world);
  const cameraEids = cameraQuery(world);

  rendererEids.forEach(rendererEid => {
    const renderer = RendererProxy.get(rendererEid).renderer;
    sceneEids.forEach(sceneEid => {
      const scene = SceneProxy.get(sceneEid).scene;
      cameraEids.forEach(cameraEid => {
        const camera = SceneCameraProxy.get(cameraEid).camera;
        renderer.render(scene, camera);
      });
    });
  });
};
