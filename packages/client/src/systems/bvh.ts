import {
  addComponent,
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld,
  removeComponent
} from "bitecs";
import { Mesh } from "three";
import { MeshBVH } from "three-mesh-bvh/src";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";
import { BVHGenerator, HasBVH } from "../components/bvh";
import { toGenerator } from "../utils/coroutine";

const generatorQuery = defineQuery([BVHGenerator, EntityObject3D]);
const enterGeneratorQuery = enterQuery(generatorQuery);
const exitGeneratorQuery = exitQuery(generatorQuery);

const generators = new Map<number, Generator>();

// TODO: Support SkinnedMesh, periodically refit

function* generate(world: IWorld, eid: number): Generator<void, void> {
  const root = EntityObject3DProxy.get(eid).root;
  const pending: Promise<void>[] = [];

  root.traverse(obj => {
    const mesh = obj as Mesh;
    if (mesh.geometry !== undefined) {
      pending.push(new Promise(resolve => {
        // Async bvh generation somehow doesn't work.
        // Using the sync one for now.
        // TODO: Use the async one
        // TODO: Remove any
        // TODO: Where to save BVH?
        // TODO: Avoid to make BVH if too many or low polygons?
        (mesh.geometry as any).boundsTree = new MeshBVH(mesh.geometry);
        resolve();
      }));
    }
  });

  yield* toGenerator(Promise.all(pending));

  if (pending.length > 0) {
    addComponent(world, HasBVH, eid);
  }
}

export const generateBVHSystem = (world: IWorld): void => {
  enterGeneratorQuery(world).forEach(eid => {
    generators.set(eid, generate(world, eid));
  });

  generatorQuery(world).forEach(eid => {
    let done = false;
    
    try {
      if (generators.get(eid).next().done === true) {
        done = true;
      }
    } catch (error) {
      done = true;
      // TODO: Proper error handling
      console.error(error);
    }
    if (done) {
      removeComponent(world, BVHGenerator, eid);
    }
  });

  exitGeneratorQuery(world).forEach(eid => {
    generators.delete(eid);
  });
};
