import {
  defineQuery,
  enterQuery,
  exitQuery,
  getEntityComponents,
  IWorld
} from "bitecs";
import { NETWORK_INTERVAL, SystemParams } from "../common";
import {
  Local,
  NetworkAdapter,
  NetworkAdapterProxy,
  Networked,
  NetworkedProxy,
  NetworkedType,
  NetworkEventSender,
  NetworkEventSenderProxy,
  NetworkMessageType
//  Shared
} from "../components/network";
import { Time, TimeProxy } from "../components/time";

const senderQuery = defineQuery([NetworkEventSender]);
const timeQuery = defineQuery([Time]);
const localQuery = defineQuery([Local, Networked]);
const localEnterQuery = enterQuery(localQuery);
const localExitQuery = exitQuery(localQuery);
const adapterQuery = defineQuery([NetworkAdapter]);

export const networkSendSystem = (world: IWorld, {serializerKeys, serializers}: SystemParams) => {
  senderQuery(world).forEach(senderEid => {
    const senderProxy = NetworkEventSenderProxy.get(senderEid);
    timeQuery(world).forEach(timeEid => {
      const timeProxy = TimeProxy.get(timeEid);

      //　Sends messages at fixed intervals (rather than anytime updated) so
      // that frequently updated components do not cause a client to flood
      // the network with an unnecessary amount of update messages
      if (timeProxy.elapsed < senderProxy.lastSendTime + NETWORK_INTERVAL) {
        return;
      }

      senderProxy.lastSendTime = timeProxy.elapsed;

      adapterQuery(world).forEach(adapterEid => {
        const adapter = NetworkAdapterProxy.get(adapterEid).adapter;

        // TODO: Implement
        localExitQuery(world).forEach(_localEid => {

        });

        //
        localEnterQuery(world).forEach(localEid => {
          const networkedProxy = NetworkedProxy.get(localEid);
          const components = [];
          for (const component of getEntityComponents(world, localEid)) {
            if (serializerKeys.has(component)) {
              const name = serializerKeys.get(component)!;
              const data = serializers.get(name).serializer(world, localEid);
              networkedProxy.setCache(name, data);
              components.push({
                name,
                data: JSON.stringify(data)
              });
            }
          }

          adapter.push(
            NetworkMessageType.CreateEntity,
            {
              components,
              network_id: networkedProxy.networkId,
              prefab: networkedProxy.prefabName,
              shared: networkedProxy.type === NetworkedType.Shared
            }
          );
        });

        //
        localQuery(world).forEach(localEid => {
          const networkedProxy = NetworkedProxy.get(localEid);
          const components = [];
          // TODO: More efficient lookup?
          for (const component of getEntityComponents(world, localEid)) {
            if (serializerKeys.has(component)) {
              const name = serializerKeys.get(component)!;
              if (networkedProxy.hasCache(name)) {
                const cache = networkedProxy.getCache(name);
                if (serializers.get(name).diffChecker(world, localEid, cache)) {
                  const data = serializers.get(name).serializer(world, localEid);
                  networkedProxy.setCache(name, data);
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
  });
};
