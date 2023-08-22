import { defineQuery, IWorld } from "bitecs";
import {
  SceneTag,
  SceneProxy
} from "../components/scene";

const sceneQuery = defineQuery([SceneTag]);

export const updateMatricesSystem = (world: IWorld): void => {
  sceneQuery(world).forEach(eid => {
    SceneProxy.get(eid).scene.updateMatrixWorld(true);
  });
};
