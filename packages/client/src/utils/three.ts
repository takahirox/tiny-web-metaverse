import { EquirectangularReflectionMapping, Mesh, Texture } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { toGenerator } from "./coroutine";

export function* loadGltf(url: string): Generator<void, GLTF> {
  // TODO: Creating GLTFLoader every time is inefficient? Reuse the loader?
  const loader = new GLTFLoader();
  return yield* toGenerator(new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  }));
}

// TODO: Implement
export const recenter = (mesh: Mesh): Mesh => {
  return mesh;
};

// TODO: Implement
export const resize = (mesh: Mesh): Mesh => {
  return mesh;
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
