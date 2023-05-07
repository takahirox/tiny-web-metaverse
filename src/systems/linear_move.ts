import { defineQuery, IWorld } from "bitecs";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";
import {
  LinearMoveBackward,
  LinearMoveForward,
  LinearMoveLeft,
  LinearMoveRight
} from "../components/linear_move";
import { Time, TimeProxy } from "../components/time";

const timeQuery = defineQuery([Time]);
const backwardQuery = defineQuery([EntityObject3D, LinearMoveBackward]);
const forwardQuery = defineQuery([EntityObject3D, LinearMoveForward]);
const leftQuery = defineQuery([EntityObject3D, LinearMoveLeft]);
const rightQuery = defineQuery([EntityObject3D, LinearMoveRight]);
export const linearMoveSystem = (world: IWorld) => {
  timeQuery(world).forEach(timeEid => {
    const delta = TimeProxy.get(timeEid).delta;

    backwardQuery(world).forEach(eid => {
      const obj = EntityObject3DProxy.get(eid).root;
      // TODO: Implement properly
      obj.position.z += LinearMoveBackward.speed[eid] * delta;
    });

    forwardQuery(world).forEach(eid => {
      const obj = EntityObject3DProxy.get(eid).root;
      // TODO: Implement properly
      obj.position.z -= LinearMoveForward.speed[eid] * delta;
    });

    leftQuery(world).forEach(eid => {
      const obj = EntityObject3DProxy.get(eid).root;
      // TODO: Implement properly
      obj.position.x -= LinearMoveLeft.speed[eid] * delta;
    });

    rightQuery(world).forEach(eid => {
      const obj = EntityObject3DProxy.get(eid).root;
      // TODO: Implement properly
      obj.position.x += LinearMoveRight.speed[eid] * delta;
    });
  });
};
