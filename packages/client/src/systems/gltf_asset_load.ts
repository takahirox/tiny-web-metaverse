import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld,
  removeComponent
} from "bitecs";
import { GltfAssetLoader, GltfAssetLoaderProxy } from "../components/gltf";
import { removeEntityIfNoComponent } from "../utils/bitecs";
import { addObject3D } from "../utils/entity_object3d";
import { loadGltf } from "../utils/three";

function* load(world: IWorld, eid: number): Generator {
  const url = GltfAssetLoaderProxy.get(eid).url;
  const gltf = yield* loadGltf(url);
  // TODO: Throw error if no gltf.scene?
  addObject3D(world, gltf.scene || gltf.scenes[0], eid);
}

const loaderQuery = defineQuery([GltfAssetLoader]);
const loaderEnterQuery = enterQuery(loaderQuery);
const loaderExitQuery = exitQuery(loaderQuery);

const generators = new Map<number, Generator>();

export const gltfAssetLoadSystem = (world: IWorld): void => {
  loaderExitQuery(world).forEach(eid => {
    generators.delete(eid);
    GltfAssetLoaderProxy.get(eid).free();
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
      removeComponent(world, GltfAssetLoader, eid);
      removeEntityIfNoComponent(world, eid);
    }
  })
};