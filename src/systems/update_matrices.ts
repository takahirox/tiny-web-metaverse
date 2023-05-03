import { defineQuery, IWorld } from "bitecs";
import {
  SceneTag,
  sceneProxy
} from "../components/scene";

const sceneQuery = defineQuery([SceneTag]);
export const updateMatricesSystem = (world: IWorld): void => {
  sceneQuery(world).forEach(eid => {
    sceneProxy.eid = eid;
    const scene = sceneProxy.scene;
    scene.updateMatrixWorld(true);
  });
};
