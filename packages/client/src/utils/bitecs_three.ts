import { addComponent, defineQuery, IWorld } from "bitecs";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { loadGltf } from "./three";
import {
  PerspectiveCameraComponent,
  PerspectiveCameraProxy,
  SceneCamera
} from "../components/camera";
import {
  GltfLoaderPluginComponent,
  GltfLoaderPluginProxy,
  GltfRoot,
  GltfRootProxy
} from "../components/gltf";
import { Renderer, RendererProxy } from "../components/renderer";
import { HasAnimations } from "../components/mixer_animation";

const rendererQuery = defineQuery([Renderer]);
const cameraQuery = defineQuery([PerspectiveCameraComponent, SceneCamera]);
const pluginQuery = defineQuery([GltfLoaderPluginComponent]);

// TODO: Return entity id, not proxy

export const getRendererProxy = (world: IWorld): RendererProxy => {
  // Assumes always single renderer entity exists
  return RendererProxy.get(rendererQuery(world)[0]);
};

export const getSceneCameraProxy = (world: IWorld): PerspectiveCameraProxy => {
  // Assumes always single scene camera entity exists
  return PerspectiveCameraProxy.get(cameraQuery(world)[0]);
};

export function* loadGltfBitecs(world: IWorld, eid: number, url: string): Generator<void, GLTF> {
  const plugins = pluginQuery(world).map(eid => GltfLoaderPluginProxy.get(eid).plugin);
  const gltf = yield* loadGltf(url, plugins);

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
