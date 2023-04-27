import { defineQuery, exitQuery, IWorld } from "bitecs";
import { Prefabs, PrefabsProxy } from "../components/prefab";

const prefabsExitQuery = exitQuery(defineQuery([Prefabs]));

export const prefabsSystem = (world: IWorld): void => {
  prefabsExitQuery(world).forEach(eid => {
    PrefabsProxy.get(eid).free(); 
  });
};
