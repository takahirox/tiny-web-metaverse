import {
  defineQuery,
  enterQuery,
  IWorld
} from "bitecs";
import {
  addAnimation,
  GltfRoot,
  GltfRootProxy,
  MixerAnimation,
  MixerAnimationProxy
} from "@tiny-web-metaverse/client/src";

const gltfEnterQuery = enterQuery(defineQuery([GltfRoot, MixerAnimation]));

export const gltfMixerAnimationSystem = (world: IWorld): void => {
  gltfEnterQuery(world).forEach(eid => {
    const root = GltfRootProxy.get(eid).root;

    if (root.animations.length === 0) {
      return;
    }

    const mixer = MixerAnimationProxy.get(eid).mixer;
    // TODO: What if asset has multiple animations?
    const action = mixer.clipAction(root.animations[0], root);
	action.play();
    addAnimation(world, eid, action);
  });
};
