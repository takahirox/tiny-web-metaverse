import {
  defineQuery,
  enterQuery,
  IWorld,
  Not
} from "bitecs";
import {
  addAnimation,
  GltfRoot,
  GltfRootProxy,
  hasComponents,
  MixerAnimation,
  MixerAnimationProxy,
  Networked,
  NetworkedMixerAnimation,
  NetworkedProxy,
  Remote,
  Shared,
  UserId,
  UserIdProxy
} from "@tiny-web-metaverse/client/src";

const gltfEnterQuery = enterQuery(defineQuery([GltfRoot, MixerAnimation, Not(Remote)]));
const userQuery = defineQuery([UserId]);

export const gltfMixerAnimationSystem = (world: IWorld): void => {
  gltfEnterQuery(world).forEach(eid => {
    if (hasComponents(world, [Networked, NetworkedMixerAnimation, Shared], eid)) {
      // Assumes always single user id entity exists
      if (NetworkedProxy.get(eid).creator !== UserIdProxy.get(userQuery(world)[0]).userId) {
        return;
      }
    }

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
