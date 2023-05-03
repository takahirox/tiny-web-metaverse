import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld
} from "bitecs";
import { Color, Scene } from "three";
import {
  EntityRootObject3DProxy,
  EntityRootObject3D
} from "../components/entity_root_object3d";
import {
  InScene,
  SceneInitialize,
  SceneInitializeProxy,
  SceneProxy,
  SceneTag
} from "../components/scene";

const initializeQuery = defineQuery([SceneInitialize]);
const initializeEnterQuery = enterQuery(initializeQuery);

const sceneQuery = defineQuery([SceneTag]);
const sceneExitQuery = exitQuery(sceneQuery);

const inSceneQuery = defineQuery([InScene, EntityRootObject3D]);
const inSceneEnterQuery = enterQuery(inSceneQuery);
const inSceneExitQuery = exitQuery(inSceneQuery);

export const sceneSystem = (world: IWorld): void => {
  initializeEnterQuery(world).forEach(eid => {
    const proxy = SceneInitializeProxy.get(eid);
    const backgroundColor = proxy.backgroundColor;
    proxy.free(world);

    const scene = new Scene();
    // Matrices are updated in updateMatricesSystem.
    scene.matrixWorldAutoUpdate = false;
    scene.background = new Color(backgroundColor);

    SceneProxy.get(eid).allocate(world, scene);
  });

  sceneExitQuery(world).forEach(eid => {
    SceneProxy.get(eid).free(world);
  });

  sceneQuery(world).forEach(eid => {
    const scene = SceneProxy.get(eid).scene;

    inSceneExitQuery(world).forEach(objEid => {
      scene.remove(EntityRootObject3DProxy.get(objEid).root);
    });

    inSceneEnterQuery(world).forEach(objEid => {
      scene.add(EntityRootObject3DProxy.get(objEid).root);
    });
  });
};
