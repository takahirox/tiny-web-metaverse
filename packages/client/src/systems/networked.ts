import { defineQuery, hasComponent, IWorld } from "bitecs";
import {
  Local,
  NetworkAdapter,
  NetworkAdapterProxy,
  NetworkedInit,
  NetworkedInitProxy,
  NetworkedProxy,
  NetworkedType,
  Shared
} from "../components/network";

const adapterQuery = defineQuery([NetworkAdapter]);
const initQuery = defineQuery([NetworkedInit]);

// For creating local or shared networked entity from local client.
// Networked entity created by remote clients are set up in networked entity system.
export const networkedSystem = (world: IWorld) => {
  initQuery(world).forEach(eid => {	
    let initialized = false; 

    const proxy = NetworkedInitProxy.get(eid);

    // Assumes single adapter entity
    adapterQuery(world).forEach(adapterEid => {
      const userId = NetworkAdapterProxy.get(adapterEid).adapter.userId;

      let type: NetworkedType;

      // Assumes either one
      // TODO: Error handling if multiple components or Remote are set?
      if (hasComponent(world, Local, eid)) {
        type = NetworkedType.Local;
      } else if (hasComponent(world, Shared, eid)) {
        type = NetworkedType.Shared;
      } else {
        throw new Error(`Invalid networked type ${type}`);
      }

      NetworkedProxy.get(eid).allocate(
        world, proxy.networkId, type, userId, proxy.prefabName);
      initialized = true;
    });

    if (initialized) {
      proxy.free(world);
    }
  });
};