import {
  addComponent,
  defineQuery,
  IWorld,
  removeEntity
} from "bitecs";
import { NETWORK_INTERVAL, Prefab } from "../common";
import {
  LinearTranslate,
  LinearRotate,
  LinearScale
} from "../components/linear_transform";
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
          if (e.data.creator !== userId) {
            const eid = managerProxy.getEid(e.data.network_id);
            if (e.data.component_name === 'position') {
              const data = JSON.parse(e.data.data);
              addComponent(world, LinearTranslate, eid);
              LinearTranslate.duration[eid] = NETWORK_INTERVAL;
              LinearTranslate.targetX[eid] = data[0];
              LinearTranslate.targetY[eid] = data[1];
              LinearTranslate.targetZ[eid] = data[2];
            } else if (e.data.component_name === 'quaternion') {
              const data = JSON.parse(e.data.data);
              addComponent(world, LinearRotate, eid);
              LinearRotate.duration[eid] = NETWORK_INTERVAL;
              LinearRotate.targetX[eid] = data[0];
              LinearRotate.targetY[eid] = data[1];
              LinearRotate.targetZ[eid] = data[2];
              LinearRotate.targetW[eid] = data[3];
            } else if (e.data.component_name === 'scale') {
              const data = JSON.parse(e.data.data);
              addComponent(world, LinearScale, eid);
              LinearScale.duration[eid] = NETWORK_INTERVAL;
              LinearScale.targetX[eid] = data[0];
              LinearScale.targetY[eid] = data[1];
              LinearScale.targetZ[eid] = data[2];
            }
          }
        }
      }
    });
  });
};