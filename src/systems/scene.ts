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
  sceneInitializeProxy,
  sceneProxy,
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
    sceneInitializeProxy.eid = eid;
    const backgroundColor = sceneInitializeProxy.backgroundColor;
    sceneInitializeProxy.remove(world);

    const scene = new Scene();
    // Matrices are updated in updateMatricesSystem.
    scene.matrixWorldAutoUpdate = false;
    scene.background = new Color(backgroundColor);

    sceneProxy.eid = eid;
    sceneProxy.add(world, scene);
  });

  sceneExitQuery(world).forEach(eid => {
    sceneProxy.eid = eid;
    sceneProxy.remove(world);
  });

  sceneQuery(world).forEach(eid => {
    sceneProxy.eid = eid;
    const scene = sceneProxy.scene;

    inSceneExitQuery(world).forEach(objEid => {
      const proxy = EntityRootObject3DProxy.get(objEid);
      scene.remove(proxy.root);
    });

    inSceneEnterQuery(world).forEach(objEid => {
      const proxy = EntityRootObject3DProxy.get(objEid);
      scene.add(proxy.root);
    });
  });
};
