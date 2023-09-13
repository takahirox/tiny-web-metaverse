import {
  addComponent,
  defineQuery,
  hasComponent,
  IWorld,
  removeEntity
} from "bitecs";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";
import {
  Networked,
  NetworkedEntityManager,
  NetworkedEntityManagerProxy,
  NetworkedProxy,
  NetworkedType,
  NetworkEvent,
  NetworkEventProxy,
  NetworkMessageType,
  Remote,
  Shared,
  StateClient,
  StateClientProxy
} from "../components/network";
import { InScene } from "../components/scene";
import { Time, TimeProxy } from "../components/time";
import { getPrefab } from "../utils/prefab";
import { hasSerializers, getSerializers } from "../utils/serializer";

const timeQuery = defineQuery([Time]);
const adapterQuery = defineQuery([StateClient]);
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

export const networkedEntitySystem = (world: IWorld) => {
  // Assume single time entity always exists
  const timeProxy = TimeProxy.get(timeQuery(world)[0]);

  adapterQuery(world).forEach(adapterEid => {
    const userId = StateClientProxy.get(adapterEid).adapter.userId;
    managerQuery(world).forEach(managerEid => {
      const managerProxy = NetworkedEntityManagerProxy.get(managerEid);
      for (const e of NetworkEventProxy.get(managerEid).events) {
        //console.log(e);
        if (e.type === NetworkMessageType.CreateEntity) {
          if (e.data.creator !== userId) {
            const prefab = getPrefab(world, e.data.prefab);
            const params = JSON.parse(e.data.prefab_params || '{}');
            const eid = prefab(world, params);
            managerProxy.add(eid, e.data.network_id, e.data.creator);
            let type: NetworkedType;
            if (e.data.shared) {
              addComponent(world, Shared, eid);
              type = NetworkedType.Shared;
            } else {
              addComponent(world, Remote, eid);
              type = NetworkedType.Remote;
            }
            addComponent(world, Networked, eid);
            const networkedProxy = NetworkedProxy.get(eid);
            networkedProxy.allocate(
              e.data.network_id,
              type,
              e.data.creator,
              e.data.prefab,
              e.data.prefab_params
            );
            for (const c of e.data.components) {
              if (hasSerializers(world, c.component_name)) {
                const data = JSON.parse(c.data);
                getSerializers(world, c.component_name)
                  // TODO: Write comment, why not networkedDeserializer but deserializer
                  .deserializer(world, eid, data);
                networkedProxy.initNetworkedComponent(
                  c.component_name,
                  data,
                  c.owner,
                  timeProxy.elapsed - c.elapsed_time,
                  c.version
                );
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
          // TODO: There is a chance that update component message arrives
          //       earlier than create entity message.
          //       Save to local storage and apply it when ready?
          const eid = managerProxy.getEid(e.data.network_id);
          // TODO: Duplicated code with the above
          for (const c of e.data.components) {
            if (hasSerializers(world, c.component_name)) {
              const networkedProxy = NetworkedProxy.get(eid);
              const networkedComponent = networkedProxy.getNetworkedComponent(c.component_name);
              if (c.version > networkedComponent.version) {
                const data = JSON.parse(c.data);
                if (c.owner !== userId) {
                  getSerializers(world, c.component_name)
                    .networkDeserializer(world, eid, data);
                }
                networkedProxy.updateNetworkedComponent(
                  c.component_name,
                  data,
                  c.owner,
                  timeProxy.elapsed - c.elapsed_time,
                  c.version
                );
              }
            } else {
              // TODO: Proper error handling
              console.warn(`Unknown component type ${c.component_name}`);
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
