import {
  Box3,
  EquirectangularReflectionMapping,
  Object3D,
  Texture,
  Vector3
} from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { toGenerator } from "./coroutine";

const box = new Box3();
const size = new Vector3();
const center = new Vector3();

export function* loadGltf(url: string): Generator<void, GLTF> {
  // TODO: Creating GLTFLoader every time is inefficient? Reuse the loader?
  const loader = new GLTFLoader();
  return yield* toGenerator(new Promise((resolve, reject) => {
    loader.load(url, gltf => {
      // TODO: What if no scene of multiple scenes?
      const scene = gltf.scene || gltf.scenes[0];
      for (const animation of gltf.animations) {
        scene.animations.push(animation);
      }
      resolve(gltf);
	}, undefined, reject);
  }));
}

export const resizeObject3D = (obj: Object3D, targetSize = 1.0): Object3D => {
  box.setFromObject(obj);

  if (box.isEmpty()) {
    return obj;
  }

  box.getSize(size);
  const scalar = targetSize / Math.max(size.x, size.y, size.z);
  obj.scale.multiplyScalar(scalar);

  return obj;
};

export const recenterObject3D = (obj: Object3D): Object3D => {
  box.setFromObject(obj);

  if (box.isEmpty()) {
    return obj;
  }

  box.getCenter(center);
  obj.position.add(center.sub(obj.position).multiplyScalar(-0.5));

  return obj;
};

export function* loadHdrTexture(url: string): Generator<void, Texture> {
  // TODO: Reuse the loader instead of creating every time?
  const loader = new RGBELoader();
  return yield* toGenerator(new Promise((resolve, reject) => {
    loader.load(url, texture => {
      // TODO: Configurable?
      texture.mapping = EquirectangularReflectionMapping;
      resolve(texture);
    }, undefined, reject);
  }));
}
