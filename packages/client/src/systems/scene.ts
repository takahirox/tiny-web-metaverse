import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld
} from "bitecs";
import {
  EntityObject3DProxy,
  EntityObject3D
} from "../components/entity_object3d";
import {
  InScene,
  SceneProxy,
  SceneTag
} from "../components/scene";

const sceneQuery = defineQuery([SceneTag]);
const sceneExitQuery = exitQuery(sceneQuery);
const inSceneQuery = defineQuery([InScene, EntityObject3D]);
const inSceneEnterQuery = enterQuery(inSceneQuery);
const inSceneExitQuery = exitQuery(inSceneQuery);

export const sceneSystem = (world: IWorld): void => {
  sceneExitQuery(world).forEach(eid => {
    // TODO: Remove all the children?
    SceneProxy.get(eid).free(); 
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
