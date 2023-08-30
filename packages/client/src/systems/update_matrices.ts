import { defineQuery, IWorld } from "bitecs";
import {
  SceneComponent,
  SceneProxy
} from "../components/scene";

const sceneQuery = defineQuery([SceneComponent]);

export const updateMatricesSystem = (world: IWorld): void => {
  sceneQuery(world).forEach(eid => {
    SceneProxy.get(eid).scene.updateMatrixWorld(true);
  });
};
