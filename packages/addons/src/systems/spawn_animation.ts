import {
  addComponent,
  defineQuery,
  enterQuery,
  IWorld,
  Not
} from "bitecs";
import {
  EntityObject3D,
  EntityObject3DProxy,
  LinearScale,
  SceneObject,
  Spawned
} from "@tiny-web-metaverse/client/src";

const enterSpawnedQuery = enterQuery(defineQuery([EntityObject3D, Not(SceneObject), Spawned]));

// Assumes scale is not changed from anywhere else

export const spawnAnimationSystem = (world: IWorld): void => {
  enterSpawnedQuery(world).forEach(eid => {
    const root = EntityObject3DProxy.get(eid).root;
    addComponent(world, LinearScale, eid);
    LinearScale.duration[eid] = 0.2;
    LinearScale.targetX[eid] = root.scale.x;
    LinearScale.targetY[eid] = root.scale.y;
    LinearScale.targetZ[eid] = root.scale.z;
    root.scale.set(0.1, 0.1, 0.1);
  });
};
