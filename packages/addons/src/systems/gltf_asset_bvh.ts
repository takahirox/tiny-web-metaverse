import {
  addComponent,
  defineQuery,
  enterQuery,
  IWorld,
  Not
} from "bitecs";
import {
  EntityObject3D,
  GltfRoot,
  SceneObject,
  BVHGenerator
} from "@tiny-web-metaverse/client/src";

const enterRootQuery =
  enterQuery(defineQuery([EntityObject3D, GltfRoot, Not(SceneObject)]));

export const gltfAssetBVHSystem = (world: IWorld): void => {
  enterRootQuery(world).forEach(eid => {
    addComponent(world, BVHGenerator, eid);
  });
};