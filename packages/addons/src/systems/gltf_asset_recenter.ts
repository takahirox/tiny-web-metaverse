import {
  defineQuery,
  enterQuery,
  IWorld,
  Not
} from "bitecs";
import { Group } from "three";
import {
  addObject3D,
  EntityObject3D,
  GltfRoot,
  GltfRootProxy,
  hasObject3D,
  recenterObject3D,
  removeObject3D,
  SceneObject
} from "@tiny-web-metaverse/client/src";

const enterRootQuery =
  enterQuery(defineQuery([EntityObject3D, GltfRoot, Not(SceneObject)]));

export const gltfAssetRecenterSystem = (world: IWorld): void => {
  enterRootQuery(world).forEach(eid => {
    const gltfRoot = GltfRootProxy.get(eid).root;

    // TODO: Write a comment for this process
    if (hasObject3D(world, gltfRoot, eid)) {
      removeObject3D(world, gltfRoot, eid);

      const group = new Group();
      group.add(gltfRoot);

      addObject3D(world, group, eid);
    }

    recenterObject3D(gltfRoot);
  });
};