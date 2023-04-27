import {
  defineQuery,
  IWorld,
} from "bitecs";
import {
  Renderer,
  RendererProxy
} from "../components/renderer";
import {
  SceneComponent,
  SceneProxy
} from "../components/scene";
import {
  PerspectiveCameraComponent,
  PerspectiveCameraProxy,
  SceneCamera
} from "../components/camera";

const rendererQuery = defineQuery([Renderer]);
const sceneQuery = defineQuery([SceneComponent]);
const cameraQuery = defineQuery([PerspectiveCameraComponent, SceneCamera]);

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
