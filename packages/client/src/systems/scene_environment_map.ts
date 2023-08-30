import {
  defineQuery,
  enterQuery,
  exitQuery,
  hasComponent,
  IWorld
} from "bitecs";
import {
  SceneComponent,
  SceneEnvironmentMap,
  SceneEnvironmentMapProxy,
  SceneProxy
} from "../components/scene";

const mapExitQuery = exitQuery(defineQuery([SceneEnvironmentMap]));
const sceneEnterQuery = enterQuery(defineQuery([SceneComponent, SceneEnvironmentMap]));

export const sceneEnvironmentMapSystem = (world: IWorld): void => {
  mapExitQuery(world).forEach(eid => {
	SceneEnvironmentMapProxy.get(eid).free();  
    if (hasComponent(world, SceneComponent, eid)) {
      const scene = SceneProxy.get(eid).scene;
      scene.background = null;
      scene.environment = null;
    }
  });

  sceneEnterQuery(world).forEach(eid => {
    const texture = SceneEnvironmentMapProxy.get(eid).texture;
    const scene = SceneProxy.get(eid).scene;
    scene.background = texture;
    scene.environment = texture;
  });
};
