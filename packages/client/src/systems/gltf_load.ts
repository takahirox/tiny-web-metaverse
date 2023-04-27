import {
  addComponent,
  defineQuery,
  enterQuery,
  exitQuery,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import {
  GltfLoader,
  GltfLoaderProxy
} from "../components/gltf";
import { Loading } from "../components/load";
import { addObject3D } from "../utils/entity_object3d";
import { loadGltfBitecs } from "../utils/bitecs_three";

function* load(world: IWorld, eid: number): Generator {
  addComponent(world, Loading, eid);
  const url = GltfLoaderProxy.get(eid).url;
  const gltf = yield* loadGltfBitecs(world, eid, url);

  // TODO: Throw error if no gltf.scene?
  const scene = gltf.scene || gltf.scenes[0];

  addObject3D(world, scene, eid);
}

const loaderQuery = defineQuery([GltfLoader]);
const loaderEnterQuery = enterQuery(loaderQuery);
const loaderExitQuery = exitQuery(loaderQuery);

const generators = new Map<number, Generator>();

export const gltfLoadSystem = (world: IWorld): void => {
  loaderExitQuery(world).forEach(eid => {
    generators.delete(eid);
    GltfLoaderProxy.get(eid).free();
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
      removeComponent(world, GltfLoader, eid);
      removeComponent(world, Loading, eid);
    }
  });
};