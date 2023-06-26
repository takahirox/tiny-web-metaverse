import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld
} from "bitecs";
import { Color, Scene } from "three";
import {
  EntityObject3DProxy,
  EntityObject3D
} from "../components/entity_object3d";
import {
  InScene,
  SceneInit,
  SceneInitProxy,
  SceneProxy,
  SceneTag
} from "../components/scene";

const sceneInitEnterQuery = enterQuery(defineQuery([SceneInit]));
const sceneQuery = defineQuery([SceneTag]);
const inSceneQuery = defineQuery([InScene, EntityObject3D]);
const inSceneEnterQuery = enterQuery(inSceneQuery);
const inSceneExitQuery = exitQuery(inSceneQuery);

export const sceneSystem = (world: IWorld): void => {
  sceneInitEnterQuery(world).forEach(eid => {
    const proxy = SceneInitProxy.get(eid);
    const backgroundColor = proxy.backgroundColor;
    proxy.free(world);

    const scene = new Scene();
    // Matrices are updated in updateMatricesSystem.
    scene.matrixWorldAutoUpdate = false;
    scene.background = new Color(backgroundColor);

    SceneProxy.get(eid).allocate(world, scene);
  });

  sceneQuery(world).forEach(eid => {
    const scene = SceneProxy.get(eid).scene;

    inSceneExitQuery(world).forEach(objEid => {
      scene.remove(EntityObject3DProxy.get(objEid).root);
    });

    inSceneEnterQuery(world).forEach(objEid => {
      scene.add(EntityObject3DProxy.get(objEid).root);
    });
  });
};
