import {
  defineQuery,
  IComponent,
  IWorld
} from "bitecs";
import { SerializerFunctions } from "../common";
import {
  ComponentKeys,
  ComponentKeysProxy,
  Serializers,
  SerializersProxy
} from "../components/serializer";

const serializersQuery = defineQuery([Serializers]);
const keysQuery = defineQuery([ComponentKeys]);

export const registerSerializers = (
  world: IWorld,
  key: string,
  component: IComponent,
  serializers: SerializerFunctions
): void => {
  // Assumes always single serializers and serializer keys entity exists
  SerializersProxy.get(serializersQuery(world)[0]).register(component, serializers);
  ComponentKeysProxy.get(keysQuery(world)[0]).register(key, component);
};

export const deregisterSerializers = (
  world: IWorld,
  key: string,
): void => {
  const component = ComponentKeysProxy.get(keysQuery(world)[0]).getComponent(key);
  SerializersProxy.get(serializersQuery(world)[0]).deregister(component);
  ComponentKeysProxy.get(keysQuery(world)[0]).deregister(key);
};

export const getSerializers = (
  world: IWorld,
  key: string
): SerializerFunctions => {
  const component = ComponentKeysProxy.get(keysQuery(world)[0]).getComponent(key);
  return SerializersProxy.get(serializersQuery(world)[0]).get(component);
};

export const hasSerializers = (
  world: IWorld,
  key: string
): boolean => {
  return ComponentKeysProxy.get(keysQuery(world)[0]).hasComponent(key);
};

export const getComponentKey = (
  world: IWorld,
  component: IComponent
): string => {
  return ComponentKeysProxy.get(keysQuery(world)[0]).getKey(component);
};

export const hasComponentKey = (
  world: IWorld,
  component: IComponent
): boolean => {
  return ComponentKeysProxy.get(keysQuery(world)[0]).hasKey(component);
};
