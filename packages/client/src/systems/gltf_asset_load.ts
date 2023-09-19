import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld,
  removeComponent
} from "bitecs";
import { Group } from "three";
import {
  GltfAssetLoader,
  GltfAssetLoaderProxy
} from "../components/gltf";
import { addObject3D } from "../utils/entity_object3d";
import { loadGltfBitecs } from "../utils/bitecs_three";
import {
  recenterObject3D,
  resizeObject3D
} from "../utils/three";

function* load(world: IWorld, eid: number): Generator {
  const url = GltfAssetLoaderProxy.get(eid).url;
  const gltf = yield* loadGltfBitecs(world, eid, url);

  // TODO: Throw error if no gltf.scene?
  const scene = gltf.scene || gltf.scenes[0];

  // TODO: Should resize be conditional?
  // TODO: Move resize to any other system?
  // TODO: Target size should be configurable
  resizeObject3D(scene, 0.5);
  recenterObject3D(scene);

  // Root object added to an entity must have identity matrix
  // when added. Then adding an extra group object because
  // gltf scene may be resized and/or recentered above.
  // TODO: Optimize. Additional group object may have bad
  //       performance impact especially when updating matrices.
  const root = new Group();
  root.add(scene);
  addObject3D(world, root, eid);
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
    }
  })
};