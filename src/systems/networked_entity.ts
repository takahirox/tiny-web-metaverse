import {
  addComponent,
  defineQuery,
  IWorld,
  removeEntity
} from "bitecs";
import { SystemParams } from "../common";
import {
  NetworkAdapter,
  NetworkAdapterProxy,
  NetworkedEntityManager,
  NetworkedEntityManagerProxy,
  NetworkedProxy,
  NetworkedType,
  NetworkEvent,
  NetworkEventProxy,
  NetworkMessageType,
  Remote
} from "../components/network";

const adapterQuery = defineQuery([NetworkAdapter]);
const managerQuery = defineQuery([NetworkedEntityManager, NetworkEvent]);

export const networkedEntitySystem = (world: IWorld, {prefabs, serializers}: SystemParams) => {
  adapterQuery(world).forEach(adapterEid => {
    const userId = NetworkAdapterProxy.get(adapterEid).adapter.userId;
    managerQuery(world).forEach(managerEid => {
      const managerProxy = NetworkedEntityManagerProxy.get(managerEid);
      for (const e of NetworkEventProxy.get(managerEid).events) {
        //console.log(e);
        if (e.type === NetworkMessageType.CreateEntity) {
          if (e.data.creator !== userId) {
            const prefab = prefabs.get(e.data.prefab);
            // TODO: Fix me
            const params = e.data.prefab_params !== undefined
              ? JSON.parse(e.data.prefab_params) : undefined;
            const eid = prefab(world, params);
            managerProxy.add(eid, e.data.network_id);
            // TODO: Consider Shared
            addComponent(world, Remote, eid);
            NetworkedProxy.get(eid).allocate(
              world,
              e.data.network_id,
              NetworkedType.Remote,
              e.data.creator,
              e.data.prefab
            );
            for (const c of e.data.components) {
              if (serializers.has(c.component_name)) {
                serializers
                  .get(c.component_name)
                  .networkDeserializer(world, eid, JSON.parse(c.data));
              } else {
                // TODO: Proper error handling
                console.warn(`Unknown component type ${c.component_name}`);
              }
            }
          }
        }
        if (e.type === NetworkMessageType.RemoveEntity) {
          if (e.data.creator !== userId) {
            const eid = managerProxy.getEid(e.data.network_id);
            removeEntity(world, eid);
            managerProxy.remove(e.data.network_id);
          }
        }
        if (e.type === NetworkMessageType.UpdateComponent) {
          if (e.data.owner !== userId) {
            const eid = managerProxy.getEid(e.data.network_id);
            // TODO: Duplicated code with the above
            for (const c of e.data.components) {
              if (serializers.has(c.component_name)) {
                serializers
                  .get(c.component_name)
                  .networkDeserializer(world, eid, JSON.parse(c.data));
              } else {
                // TODO: Proper error handling
                console.warn(`Unknown component type ${c.component_name}`);
              }
            }
          }
        }
      }
    });
  });
};
