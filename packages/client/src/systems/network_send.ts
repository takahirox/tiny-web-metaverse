import {
  defineQuery,
  enterQuery,
  hasComponent,
  getEntityComponents,
  IWorld
} from "bitecs";
import {
  INITIAL_VERSION,
  NETWORK_INTERVAL
} from "../common";
import {
  Networked,
  NetworkedEntityManager,
  NetworkedEntityManagerProxy,
  NetworkedProxy,
  NetworkedType,
  NetworkEventSender,
  NetworkMessageType,
  Remote,
  StateClient,
  StateClientProxy
} from "../components/network";
import {
  hasComponentKey,
  getComponentKey,
  getSerializers
} from "../utils/serializer";
import { getTimeProxy } from "../utils/time";

const senderQuery = defineQuery([NetworkEventSender]);
const networkedQuery = defineQuery([Networked]);
const networkedEnterQuery = enterQuery(networkedQuery);
const adapterQuery = defineQuery([StateClient]);
const managerQuery = defineQuery([NetworkedEntityManager]);

export const networkSendSystem = (world: IWorld) => {
  senderQuery(world).forEach(senderEid => {
    const lastSendTime = NetworkEventSender.lastSendTime[senderEid];
    const timeProxy = getTimeProxy(world);

    // Sends messages at fixed intervals (rather than anytime updated) so
    // that frequently updated components do not cause a client to flood
    // the network with an unnecessary amount of update messages
    if (timeProxy.elapsed < lastSendTime + NETWORK_INTERVAL) {
      return;
    }

    NetworkEventSender.lastSendTime[senderEid] = timeProxy.elapsed;

    adapterQuery(world).forEach(adapterEid => {
      const adapter = StateClientProxy.get(adapterEid).adapter;
      const myUserId = adapter.userId;

      managerQuery(world).forEach(managerEid => {
        // TODO: Implement exit

        //
        networkedEnterQuery(world).forEach(networkedEid => {
          // TODO: Possible to use non-Remote Query for optimization?
          if (hasComponent(world, Remote, networkedEid)) {
            return;
          }

          const networkedProxy = NetworkedProxy.get(networkedEid);

          if (networkedProxy.creator !== myUserId) {
            return;
          }

          const components = [];
          for (const component of getEntityComponents(world, networkedEid)) {
            if (hasComponentKey(world, component)) {
              const name = getComponentKey(world, component);
              const data = getSerializers(world, name).serializer(world, networkedEid);
              networkedProxy.initNetworkedComponent(
                name,
                data,
                myUserId,
                timeProxy.elapsed,
                INITIAL_VERSION
              );
              components.push({
                name,
                data: JSON.stringify(data)
              });
            }
          }

          const networkId = networkedProxy.networkId;

          adapter.push(
            NetworkMessageType.CreateEntity,
            {
              components,
              network_id: networkId,
              prefab: networkedProxy.prefabName,
              // TODO: Fix me
              prefab_params: JSON.stringify(networkedProxy.prefabParams),
              shared: networkedProxy.type === NetworkedType.Shared
            }
          );

          NetworkedEntityManagerProxy
            .get(managerEid)
            .add(networkedEid, networkId, myUserId);
        });
      });

      //
      networkedQuery(world).forEach(networkedEid => {
        // TODO: Possible to use non-Remote Query for optimization?
        if (hasComponent(world, Remote, networkedEid)) {
          return;
        }

        const networkedProxy = NetworkedProxy.get(networkedEid);

        const components = [];
        // TODO: More efficient lookup?
        for (const component of getEntityComponents(world, networkedEid)) {
          if (hasComponentKey(world, component)) {
            const name = getComponentKey(world, component);
            if (networkedProxy.hasNetworkedComponent(name)) {
              const networkedComponent = networkedProxy.getNetworkedComponent(name)
              if (getSerializers(world, name).diffChecker(
                world,
                networkedEid,
                networkedComponent.cache,
                networkedComponent.updatedAt
              )) {
                const data = getSerializers(world, name).serializer(world, networkedEid);
                components.push({
                  name,
                  data: JSON.stringify(data)
                });
              }
            } else {
              // TODO: Send add component message?
            }
          }
        }

        if (components.length > 0) {
          adapter.push(
            NetworkMessageType.UpdateComponent,
            {
              components,
              network_id: networkedProxy.networkId
            }
          );
        }
      });
    });
  });
};
