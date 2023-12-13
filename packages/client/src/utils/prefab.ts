import {
  defineQuery,
  IWorld
} from "bitecs";
import { Prefab } from "../common";
import { Prefabs, PrefabsProxy } from "../components/prefab";

const prefabsQuery = defineQuery([Prefabs]);

export const registerPrefab = (
  world: IWorld,
  key: string,
  prefab: Prefab
): void => {
  // Assumes always single prefabs entity exists
  const proxy = PrefabsProxy.get(prefabsQuery(world)[0]);
  proxy.register(key, prefab);
};

export const deregisterPrefab = (
  world: IWorld,
  key: string
): void => {
  const proxy = PrefabsProxy.get(prefabsQuery(world)[0]);
  proxy.deregister(key);
};

export const getPrefab = (
  world: IWorld,
  key: string
): Prefab => {
  const proxy = PrefabsProxy.get(prefabsQuery(world)[0]);
  return proxy.get(key);
};
