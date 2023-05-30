import {
  addComponent,
  hasComponent,
  IWorld
} from "bitecs";
import { F32_EPSILON, NETWORK_INTERVAL } from "../common";
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

// Parameter Types

export type SerializedPosition = [x: number, y: number, z: number];
export type SerializedQuaternion = [x: number, y: number, z: number, w: number];
export type SerializedScale = [x: number, y: number, z: number];

// TODO: Validation

// Position

const serializePosition = (world: IWorld, eid: number): SerializedPosition => {
  if (!hasComponent(world, EntityObject3D, eid)) {
    throw new Error('serializePosition requires EntityObject3D component.');
  }
  return EntityObject3DProxy.get(eid).root.position.toArray();
};

const deserializePosition = (world: IWorld, eid: number, data: SerializedPosition): void => {
  if (!hasComponent(world, EntityObject3D, eid)) {
    throw new Error('deserializePosition requires EntityObject3D component.');
  }
  EntityObject3DProxy.get(eid).root.position.fromArray(data);
  addComponent(world, TransformUpdated, eid);
};

const deserializeNetworkedPosition = (world: IWorld, eid: number, data: SerializedPosition): void => {
  if (!hasComponent(world, EntityObject3D, eid)) {
    throw new Error('deserializeNetworkedPosition requires EntityObject3D component.');
  }
  addComponent(world, LinearTranslate, eid);
  LinearTranslate.duration[eid] = NETWORK_INTERVAL;
  LinearTranslate.targetX[eid] = data[0];
  LinearTranslate.targetY[eid] = data[1];
  LinearTranslate.targetZ[eid] = data[2];
};

const checkPositionDiff = (world: IWorld, eid: number, cache: SerializedPosition): boolean => {
  if (!hasComponent(world, EntityObject3D, eid)) {
    throw new Error('checkPositionDiff requires EntityObject3D component.');
  }
  const position = EntityObject3DProxy.get(eid).root.position;
  return Math.abs(position.x - cache[0]) > F32_EPSILON ||
    Math.abs(position.y - cache[1]) > F32_EPSILON ||
    Math.abs(position.z - cache[2]) > F32_EPSILON;
};

// Quaternion

const serializeQuaternion = (world: IWorld, eid: number): SerializedQuaternion => {
  if (!hasComponent(world, EntityObject3D, eid)) {
    throw new Error('serializeQuaternion requires EntityObject3D component.');
  }
  // TODO: Remove cast
  return EntityObject3DProxy.get(eid).root.quaternion.toArray() as SerializedQuaternion;
};

const deserializeQuaternion = (world: IWorld, eid: number, data: SerializedQuaternion): void => {
  if (!hasComponent(world, EntityObject3D, eid)) {
    throw new Error('deserializeQuaternion requires EntityObject3D component.');
  }
  EntityObject3DProxy.get(eid).root.quaternion.fromArray(data);
  addComponent(world, TransformUpdated, eid);
};

const deserializeNetworkedQuaternion = (world: IWorld, eid: number, data: SerializedQuaternion): void => {
  if (!hasComponent(world, EntityObject3D, eid)) {
    throw new Error('deserializeNetworkedQuaternion requires EntityObject3D component.');
  }
  addComponent(world, LinearRotate, eid);
  LinearRotate.duration[eid] = NETWORK_INTERVAL;
  LinearRotate.targetX[eid] = data[0];
  LinearRotate.targetY[eid] = data[1];
  LinearRotate.targetZ[eid] = data[2];
  LinearRotate.targetW[eid] = data[3];
};

const checkQuaternionDiff = (world: IWorld, eid: number, cache: SerializedQuaternion): boolean => {
  if (!hasComponent(world, EntityObject3D, eid)) {
    throw new Error('checkQuaternionDiff requires EntityObject3D component.');
  }
  const quaternion = EntityObject3DProxy.get(eid).root.quaternion;
  return Math.abs(quaternion.x - cache[0]) > F32_EPSILON ||
    Math.abs(quaternion.y - cache[1]) > F32_EPSILON ||
    Math.abs(quaternion.z - cache[2]) > F32_EPSILON ||
    Math.abs(quaternion.w - cache[3]) > F32_EPSILON;
};

// Scale

const serializeScale = (world: IWorld, eid: number): SerializedScale => {
  if (!hasComponent(world, EntityObject3D, eid)) {
    throw new Error('serializeScale requires EntityObject3D component.');
  }
  return EntityObject3DProxy.get(eid).root.scale.toArray();
};

const deserializeScale = (world: IWorld, eid: number, data: SerializedScale): void => {
  if (!hasComponent(world, EntityObject3D, eid)) {
    throw new Error('deserializeScale requires EntityObject3D component.');
  }
  EntityObject3DProxy.get(eid).root.scale.fromArray(data);
  addComponent(world, TransformUpdated, eid);
};

const deserializeNetworkedScale = (world: IWorld, eid: number, data: SerializedScale): void => {
  if (!hasComponent(world, EntityObject3D, eid)) {
    throw new Error('deserializeNetworkedScale requires EntityObject3D component.');
  }
  addComponent(world, LinearTranslate, eid);
  LinearScale.duration[eid] = NETWORK_INTERVAL;
  LinearScale.targetX[eid] = data[0];
  LinearScale.targetY[eid] = data[1];
  LinearScale.targetZ[eid] = data[2];
};

const checkScaleDiff = (world: IWorld, eid: number, cache: SerializedScale): boolean => {
  if (!hasComponent(world, EntityObject3D, eid)) {
    throw new Error('checkScaleDiff requires EntityObject3D component.');
  }
  const scale = EntityObject3DProxy.get(eid).root.scale;
  return Math.abs(scale.x - cache[0]) > F32_EPSILON ||
    Math.abs(scale.y - cache[1]) > F32_EPSILON ||
    Math.abs(scale.z - cache[2]) > F32_EPSILON;
};

// Export

export const positionSerializers = {
  deserializer: deserializePosition,
  diffChecker: checkPositionDiff,
  networkDeserializer: deserializeNetworkedPosition,
  serializer: serializePosition,
};

export const quaternionSerializers = {
  deserializer: deserializeQuaternion,
  diffChecker: checkQuaternionDiff,
  networkDeserializer: deserializeNetworkedQuaternion,
  serializer: serializeQuaternion,
};

export const scaleSerializers = {
  deserializer: deserializeScale,
  diffChecker: checkScaleDiff,
  networkDeserializer: deserializeNetworkedScale,
  serializer: serializeScale,
};
