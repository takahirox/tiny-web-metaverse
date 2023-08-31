import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  SceneComponent,
  SceneEnvironmentMapLoader,
  SceneEnvironmentMapLoaderProxy,
  SceneProxy
} from "../components/scene";
import { loadHdrTexture } from "../utils/three";

const loaderQuery = defineQuery([SceneEnvironmentMapLoader]);
const loaderEnterQuery = enterQuery(loaderQuery);
const loaderExitQuery = exitQuery(loaderQuery);
const sceneQuery = defineQuery([SceneComponent]);

function* load(world: IWorld, eid: number): Generator<void, void> {
  const url = SceneEnvironmentMapLoaderProxy.get(eid).url;
  const texture = yield* loadHdrTexture(url);
  sceneQuery(world).forEach(sceneEid => {
    // TODO: What if scene already has environment map?
    const scene = SceneProxy.get(sceneEid).scene;
    scene.background = texture;
    scene.environment = texture;
  });
}

const generators = new Map<number, Generator>();

export const sceneEnvironmentMapLoadSystem = (world: IWorld): void => {
  loaderExitQuery(world).forEach(eid => {
    generators.delete(eid);
  });

  loaderEnterQuery(world).forEach(eid => {
    generators.set(eid, load(world, eid));
  });

  loaderQuery(world).forEach(eid => {
    let done = false;
    try {
      if (generators.get(eid).next().done === true) {
        done = true;
      }
    } catch (error) {
      // TODO: Proper error handling
      console.error(error);
      done = true;
    }
    if (done) {
      removeComponent(world, SceneEnvironmentMapLoader, eid);
    }
  });
};
