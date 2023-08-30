import { Mesh } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
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
