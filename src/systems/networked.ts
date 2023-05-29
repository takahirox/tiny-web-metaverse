import { defineQuery, hasComponent, IWorld } from "bitecs";
import {
  Local,
  NetworkAdapter,
  NetworkAdapterProxy,
  NetworkedInit,
  NetworkedInitProxy,
  NetworkedProxy,
  NetworkedType,
  Remote,
  Shared
} from "../components/network";

const adapterQuery = defineQuery([NetworkAdapter]);
const initQuery = defineQuery([NetworkedInit]);

export const networkedSystem = (world: IWorld) => {
  initQuery(world).forEach(eid => {	
    let initialized = false; 

    const proxy = NetworkedInitProxy.get(eid);

    // Assumes single adapter entity
    adapterQuery(world).forEach(adapterEid => {
      const userId = NetworkAdapterProxy.get(adapterEid).adapter.userId;

      let type: NetworkedType | null = null;

      // Assumes either one
      // TODO: Error handling if multiple components are set?
      if (hasComponent(world, Local, eid)) {
        type = NetworkedType.Local;
      } else if (hasComponent(world, Remote, eid)) {
        type = NetworkedType.Remote;
      } else if (hasComponent(world, Shared, eid)) {
        type = NetworkedType.Shared;
      }

      if (type !== null) {
        NetworkedProxy.get(eid).allocate(
          world, proxy.networkId, type, userId, proxy.prefabName);
        initialized = true;
      }
    });

    if (initialized) {
      proxy.free(world);
    }
  });
};