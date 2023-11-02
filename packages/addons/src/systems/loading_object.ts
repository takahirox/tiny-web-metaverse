import {
  addComponent,
  defineQuery,
  enterQuery,
  entityExists,
  exitQuery,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import { AnimationMixer, Group } from "three";
import {
  addObject3D,
  getTimeProxy,
  loadGltf,
  Loading,
  recenterObject3D,
  removeObject3D,
  resizeObject3D
} from "@tiny-web-metaverse/client/src";
import {
  LoadingObject,
  LoadingObjectLoader,
  LoadingObjectProxy
} from "../components/loading_object";
import { loadingObjectDataURL } from "../../assets/models/loading_object";

// TODO: Reuse GltfAssetLoader if possible, or write a comment about why
//       we can't reuse it
// TODO: Remove duplicated code with the one in gltf asset load system.
// TODO: Preload and synchronously make a clone
function* load(world: IWorld, eid: number): Generator {
  const gltf = yield* loadGltf(loadingObjectDataURL);

  // Entity's loading already finished or entity is already removed
  // while loading "loading object".
  // TODO: More proper resource release?
  if (!entityExists(world, eid) ||
    !hasComponent(world, Loading, eid) ||
    !hasComponent(world, LoadingObjectLoader, eid)) {
    return;
  }

  const scene = gltf.scene || gltf.scenes[0];
  // See the comments in gltf asset load system for the followings.
  resizeObject3D(scene, 0.5);
  recenterObject3D(scene);

  const root = new Group();
  root.add(scene);
  addObject3D(world, root, eid);

  const mixer = new AnimationMixer(root);

  for (const animation of gltf.animations) {
    mixer.clipAction(animation).play();
  }

  addComponent(world, LoadingObject, eid);
  LoadingObjectProxy.get(eid).allocate(root, mixer);
}

const loadingQuery = defineQuery([Loading]);
const enterLoadingQuery = enterQuery(loadingQuery);
const exitLoadingQuery = exitQuery(loadingQuery);

const loaderQuery = defineQuery([LoadingObjectLoader]);
const enterLoaderQuery = enterQuery(loaderQuery);
const exitLoaderQuery = exitQuery(loaderQuery);

const objectQuery = defineQuery([LoadingObject]);
const exitObjectQuery = exitQuery(objectQuery);

const generators = new Map<number, Generator>();

export const loadingObjectSystem = (world: IWorld): void => {
  enterLoadingQuery(world).forEach(eid => {
    addComponent(world, LoadingObjectLoader, eid);
  });

  enterLoaderQuery(world).forEach(eid => {
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
      removeComponent(world, LoadingObjectLoader, eid);
    }
  });

  exitLoaderQuery(world).forEach(eid => {
    generators.delete(eid);
  });

  exitLoadingQuery(world).forEach(eid => {
    if (hasComponent(world, LoadingObjectLoader, eid)) {
      removeComponent(world, LoadingObjectLoader, eid);
    }
    if (hasComponent(world, LoadingObject, eid)) {
      removeComponent(world, LoadingObject, eid);
    }
  });

  exitObjectQuery(world).forEach(eid => {
    const proxy = LoadingObjectProxy.get(eid);

    // TODO: Proper resource release
    proxy.mixer.stopAllAction();
    removeObject3D(world, proxy.group, eid);

    proxy.free();
  });

  objectQuery(world).forEach(eid => {
    LoadingObjectProxy.get(eid).mixer.update(getTimeProxy(world).delta);
  });
};
