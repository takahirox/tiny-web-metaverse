import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld,
  removeComponent
} from "bitecs";
import { Mesh } from "three";
import { MeshBVH } from "three-mesh-bvh/src";
//
// @ts-ignore
import { GenerateMeshBVHWorker } from "three-mesh-bvh/src/workers/GenerateMeshBVHWorker";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";
import { BVHGenerator } from "../components/bvh";
import { toGenerator } from "../utils/coroutine";

const generatorQuery = defineQuery([BVHGenerator, EntityObject3D]);
const enterGeneratorQuery = enterQuery(generatorQuery);
const exitGeneratorQuery = exitQuery(generatorQuery);

const generators = new Map<number, Generator>();

function* generate(_world: IWorld, eid: number): Generator<void, void> {
  const root = EntityObject3DProxy.get(eid).root;
  const pending: Promise<void>[] = [];

  root.traverse(obj => {
    const mesh = obj as Mesh;
    if (mesh.geometry !== undefined) {
      const worker = new GenerateMeshBVHWorker();
	  pending.push(worker.generate(mesh.geometry).then((bvh: MeshBVH) => {
        // TODO: Remove any
        (mesh.geometry as any).boundsTree = bvh;
      }));
    }
  });

  yield* toGenerator(Promise.all(pending));
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
