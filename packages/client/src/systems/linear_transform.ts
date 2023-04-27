import {
  addComponent,
  defineQuery,
  IWorld,
  removeComponent
} from "bitecs";
import { Vector3, Quaternion } from "three";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";
import {
  LinearTranslate,
  LinearRotate,
  LinearScale
} from "../components/linear_transform";
import { TransformUpdated } from "../components/transform";
import { getTimeProxy } from "../utils/time";

// Working variables
const _vec3 = new Vector3();
const _quat = new Quaternion();

const linearTranslateQuery = defineQuery([LinearTranslate, EntityObject3D]);
const linearRotateQuery = defineQuery([LinearRotate, EntityObject3D]);
const linearScaleQuery = defineQuery([LinearScale, EntityObject3D]);

export const linearTransformSystem = (world: IWorld) => {
  const delta = getTimeProxy(world).delta;

  linearTranslateQuery(world).forEach(eid => {
    const duration = LinearTranslate.duration[eid];
    const targetX = LinearTranslate.targetX[eid];
    const targetY = LinearTranslate.targetY[eid];
    const targetZ = LinearTranslate.targetZ[eid];
    const root = EntityObject3DProxy.get(eid).root;

    if (delta >= duration) {
      root.position.set(targetX, targetY, targetZ);
      removeComponent(world, LinearTranslate, eid);
    } else {
      root.position.lerp(_vec3.set(targetX, targetY, targetZ), delta / duration);
      LinearTranslate.duration[eid] = duration - delta;
    }

    addComponent(world, TransformUpdated, eid);
  });

  linearRotateQuery(world).forEach(eid => {
    const duration = LinearRotate.duration[eid];
    const targetX = LinearRotate.targetX[eid];
    const targetY = LinearRotate.targetY[eid];
    const targetZ = LinearRotate.targetZ[eid];
    const targetW = LinearRotate.targetW[eid];
    const root = EntityObject3DProxy.get(eid).root;

    if (delta >= duration) {
      root.quaternion.set(targetX, targetY, targetZ, targetW);
      removeComponent(world, LinearRotate, eid);
    } else {
      root.quaternion.slerp(_quat.set(targetX, targetY, targetZ, targetW), delta / duration);
      LinearRotate.duration[eid] = duration - delta;
    }

    addComponent(world, TransformUpdated, eid);
  });

  linearScaleQuery(world).forEach(eid => {
    const duration = LinearScale.duration[eid];
    const targetX = LinearScale.targetX[eid];
    const targetY = LinearScale.targetY[eid];
    const targetZ = LinearScale.targetZ[eid];
    const root = EntityObject3DProxy.get(eid).root;

    if (delta >= duration) {
      root.scale.set(targetX, targetY, targetZ);
      removeComponent(world, LinearScale, eid);
    } else {
      root.scale.lerp(_vec3.set(targetX, targetY, targetZ), delta / duration);
      LinearScale.duration[eid] = duration - delta;
    }

    addComponent(world, TransformUpdated, eid);
  });
};
