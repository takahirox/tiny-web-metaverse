import {
  defineQuery,
  exitQuery,
  IWorld
} from "bitecs";
import { GltfRoot, GltfRootProxy } from "../components/gltf";

const gltfExitQuery = exitQuery(defineQuery([GltfRoot]));

export const gltfSystem = (world: IWorld): void => {
  gltfExitQuery(world).forEach(eid => {
    GltfRootProxy.get(eid).free(); 
  });
};
