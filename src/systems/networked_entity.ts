import {
  addComponent,
  defineQuery,
  hasComponent,
  IWorld,
  removeEntity
} from "bitecs";
import { SystemParams } from "../common";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";
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
import { InScene } from "../components/scene";

const adapterQuery = defineQuery([NetworkAdapter]);
const managerQuery = defineQuery([NetworkedEntityManager, NetworkEvent]);

// TODO: Implement properly
const removeComponentsAndEntity = (world: IWorld, eid: number): void => {
  // TODO: We may need a helper function to remove entity because
  //       some components need proxy to be removed and some other
  //       components need to be removed in system with Destroy component

  // Remove associated object 3Ds from the scene
  // TODO: This may be needed to be done in the future helper function
  if (hasComponent(world, EntityObject3D, eid) &&
    hasComponent(world, InScene, eid)) {
    const root = EntityObject3DProxy.get(eid).root;
    root.parent.remove(root);
  }

  removeEntity(world, eid);
};

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
            managerProxy.add(eid, e.data.network_id, e.data.creator);
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
            removeComponentsAndEntity(world, eid);
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
        if (e.type === NetworkMessageType.UserLeft) {
          if (e.data.user_id !== userId) {
            for (const networkId of managerProxy.getNetworkIdsByUserId(e.data)) {
              const eid = managerProxy.getEid(networkId);
              removeComponentsAndEntity(world, eid);
		    }
            managerProxy.clearNetworkIdsByUserId(e.data);
          }
        }
      }
    });
  });
};
