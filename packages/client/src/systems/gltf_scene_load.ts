import {
  addComponent,
  defineQuery,
  enterQuery,
  exitQuery,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import { Loading } from "../components/load";
import {
  GltfSceneLoader,
  GltfSceneLoaderProxy
} from "../components/gltf";
import { SceneObject } from "../components/scene";
import { addObject3D } from "../utils/entity_object3d";
import { loadGltfBitecs } from "../utils/bitecs_three";

function* load(world: IWorld, eid: number): Generator {
  addComponent(world, Loading, eid);
  const url = GltfSceneLoaderProxy.get(eid).url;
  const gltf = yield* loadGltfBitecs(world, eid, url);
  // TODO: Throw error if no gltf.scene?
  const scene = gltf.scene || gltf.scenes[0];
  addObject3D(world, scene, eid);
  addComponent(world, SceneObject, eid);
}

const loaderQuery = defineQuery([GltfSceneLoader]);
const loaderEnterQuery = enterQuery(loaderQuery);
const loaderExitQuery = exitQuery(loaderQuery);

const generators = new Map<number, Generator>();

export const gltfSceneLoadSystem = (world: IWorld): void => {
  loaderExitQuery(world).forEach(eid => {
    generators.delete(eid);
    GltfSceneLoaderProxy.get(eid).free();
    if (hasComponent(world, Loading, eid)) {
      removeComponent(world, Loading, eid);
    }
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
      removeComponent(world, GltfSceneLoader, eid);
      removeComponent(world, Loading, eid);
    }
  })
};