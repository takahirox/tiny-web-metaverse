import { addComponent, defineQuery, IWorld } from "bitecs";
import { Vector3 } from "three";
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
import { TransformUpdated } from "../components/transform";
import { getTimeProxy } from "../utils/time";

const vec3 = new Vector3();

const move = (
  world: IWorld,
  eid: number,
  direction: Vector3,
  speed: number,
  delta: number
): void => {
  const obj = EntityObject3DProxy.get(eid).root;
  obj.position.add(
    direction
      .applyQuaternion(obj.quaternion)
      .setY(0)
      .normalize()
      .multiplyScalar(speed * delta)
  );
  addComponent(world, TransformUpdated, eid);
};

const backwardQuery = defineQuery([EntityObject3D, LinearMoveBackward]);
const forwardQuery = defineQuery([EntityObject3D, LinearMoveForward]);
const leftQuery = defineQuery([EntityObject3D, LinearMoveLeft]);
const rightQuery = defineQuery([EntityObject3D, LinearMoveRight]);
export const linearMoveSystem = (world: IWorld) => {
  const delta = getTimeProxy(world).delta;

  backwardQuery(world).forEach(eid => {
    move(world, eid, vec3.set(0, 0, 1), LinearMoveBackward.speed[eid], delta);
  });

  forwardQuery(world).forEach(eid => {
    move(world, eid, vec3.set(0, 0, -1), LinearMoveForward.speed[eid], delta);
  });

  leftQuery(world).forEach(eid => {
    move(world, eid, vec3.set(-1, 0, 0), LinearMoveLeft.speed[eid], delta);
  });

  rightQuery(world).forEach(eid => {
    move(world, eid, vec3.set(1, 0, 0), LinearMoveRight.speed[eid], delta);
  });
};
