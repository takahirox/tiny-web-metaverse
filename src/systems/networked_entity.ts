import {
  addComponent,
  defineQuery,
  hasComponent,
  IWorld,
  removeEntity
} from "bitecs";
import { Prefab } from "../common";
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

const adapterQuery = defineQuery([NetworkAdapter]);
const managerQuery = defineQuery([NetworkedEntityManager, NetworkEvent]);

export const networkedEntitySystem = (world: IWorld, prefabs: Map<string, Prefab>) => {
  adapterQuery(world).forEach(adapterEid => {
    const userId = NetworkAdapterProxy.get(adapterEid).adapter.userId;
    managerQuery(world).forEach(managerEid => {
      const managerProxy = NetworkedEntityManagerProxy.get(managerEid);
      for (const e of NetworkEventProxy.get(managerEid).events) {
        console.log(e);
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
          const eid = managerProxy.getEid(e.data.network_id);
          if (e.data.component_name === 'position') {
            if (hasComponent(world, EntityObject3D, eid)) {
              const root = EntityObject3DProxy.get(eid).root;
              root.position.fromArray(JSON.parse(e.data.data));
console.log('position update');
            }
          } else if (e.data.component_name === 'quaternion') {
            if (hasComponent(world, EntityObject3D, eid)) {
              const root = EntityObject3DProxy.get(eid).root;
              root.quaternion.fromArray(JSON.parse(e.data.data));
            }
          } else if (e.data.component_name === 'scale') {
            if (hasComponent(world, EntityObject3D, eid)) {
              const root = EntityObject3DProxy.get(eid).root;
              root.scale.fromArray(JSON.parse(e.data.data));
            }
          }
        }
      }
    });
  });
};