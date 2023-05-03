import {
  defineQuery,
  IWorld,
} from "bitecs";
import {
  rendererProxy,
  RendererTag
} from "../components/renderer";
import {
  sceneProxy,
  SceneTag
} from "../components/scene";
import {
  SceneCamera,
  sceneCameraProxy
} from "../components/scene_camera";

const rendererQuery = defineQuery([RendererTag]);
const sceneQuery = defineQuery([SceneTag]);
const cameraQuery = defineQuery([SceneCamera]);

export const renderSystem = (world: IWorld): void => {
  const rendererEids = rendererQuery(world);
  const sceneEids = sceneQuery(world);
  const cameraEids = cameraQuery(world);

  rendererEids.forEach(rendererEid => {
    sceneEids.forEach(sceneEid => {
      cameraEids.forEach(cameraEid => {
        rendererProxy.eid = rendererEid;	
        const renderer = rendererProxy.renderer; 

        sceneProxy.eid = sceneEid;
        const scene = sceneProxy.scene;

        sceneCameraProxy.eid = cameraEid;
        const camera = sceneCameraProxy.camera;

        renderer.render(scene, camera);
      });
    });
  });
};
