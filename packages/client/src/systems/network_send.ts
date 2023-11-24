import {
  defineQuery,
  enterQuery,
  exitQuery,
  hasComponent,
  getEntityComponents,
  IWorld,
  removeComponent
} from "bitecs";
import {
  INITIAL_VERSION,
  LOCAL_VERSION,
  NETWORK_INTERVAL
} from "../common";
import {
  BroadcastRequestor,
  BroadcastRequestorProxy,
  Networked,
  NetworkedEntityManager,
  NetworkedEntityManagerProxy,
  NetworkedProxy,
  NetworkedType,
  NetworkEventSender,
  NetworkMessageType,
  Remote
} from "../components/network";
import { removeEntityIfNoComponent } from "../utils/bitecs";
import { getMyUserId, getStateAdapter } from "../utils/network";
import {
  hasComponentKey,
  getComponentKey,
  getSerializers
} from "../utils/serializer";
import { getTimeProxy } from "../utils/time";

const senderQuery = defineQuery([NetworkEventSender]);
const networkedQuery = defineQuery([Networked]);
const networkedEnterQuery = enterQuery(networkedQuery);
const managerQuery = defineQuery([NetworkedEntityManager]);
const broadcastorQuery = defineQuery([BroadcastRequestor]);
const exitBroadcastorQuery = exitQuery(broadcastorQuery);

// TODO: Implement remove entity

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

    const adapter = getStateAdapter(world);
    const myUserId = getMyUserId(world);

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
              INITIAL_VERSION // TODO: LOCAL_VERSION instead?
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
              networkedProxy.updateNetworkedComponent(
                name,
                data,
                myUserId,
                timeProxy.elapsed,
                LOCAL_VERSION
              );
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

  // TODO: Make another system for broadcasting?

  broadcastorQuery(world).forEach(eid => {
    getStateAdapter(world).push(
      NetworkMessageType.Broadcast,
      {
        data: BroadcastRequestorProxy.get(eid).data
      }
    );
    removeComponent(world, BroadcastRequestor, eid);
    removeEntityIfNoComponent(world, eid);
  });

  exitBroadcastorQuery(world).forEach(eid => {
    BroadcastRequestorProxy.get(eid).free();
  });
};
