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

        localEnterQuery(world).forEach(localEid => {
          const components = [];
          // TODO: More efficient lookup?
          for (const component of getEntityComponents(world, localEid)) {
            if (serializerKeys.has(component)) {
              const name = serializerKeys.get(component)!;
              components.push({
                name,
                data: JSON.stringify(serializers.get(name).serializer(world, localEid))
              });
            }
          }

          const networkedProxy = NetworkedProxy.get(localEid);
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

        // TODO: Implement properly
        localQuery(world).forEach(localEid => {
          const components = [];
          for (const component of getEntityComponents(world, localEid)) {
            if (serializerKeys.has(component)) {
              const name = serializerKeys.get(component)!;
              components.push({
                name,
                data: JSON.stringify(serializers.get(name).serializer(world, localEid))
              });
            }
          }

          if (components.length > 0) {
            adapter.push(
              NetworkMessageType.UpdateComponent,
              {
                components,
                network_id: NetworkedProxy.get(localEid).networkId
              }
            );
          }
        });
      });
    });
  });
};
