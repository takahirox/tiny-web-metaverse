import { addComponent, IWorld } from "bitecs";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { loadGltf } from "./three";
import { GltfRoot, GltfRootProxy } from "../components/gltf";
import { HasAnimations } from "../components/mixer_animation";

export function* loadGltfBitecs(world: IWorld, eid: number, url: string): Generator<void, GLTF> {
  const gltf = yield* loadGltf(url);

  // TODO: Throw error if no gltf.scene?
  // TODO: What if multiple scenes?
  const scene = gltf.scene || gltf.scenes[0];

  for (const animation of gltf.animations) {
    scene.animations.push(animation);
  }

  addComponent(world, GltfRoot, eid);
  GltfRootProxy.get(eid).allocate(scene);

  // TODO: Write comment
  if (scene.animations.length > 0) {
    addComponent(world, HasAnimations, eid);
  }

  return gltf;
};
