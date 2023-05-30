import {
  defineQuery,
  enterQuery,
  exitQuery,
  hasComponent,
  IWorld
} from "bitecs";
import { NETWORK_INTERVAL } from "../common";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";
import {
  Local,
  NetworkAdapter,
  NetworkAdapterProxy,
  Networked,
  NetworkedProxy,
  NetworkedTransform,
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

export const networkSendSystem = (world: IWorld) => {
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
          // TODO: Where shold NetworkedTransform be handled?
          // TODO: Implement properly
          if (hasComponent(world, NetworkedTransform, localEid) &&
            hasComponent(world, EntityObject3D, localEid)) {
            const networkedProxy = NetworkedProxy.get(localEid);
            const root = EntityObject3DProxy.get(localEid).root;
            adapter.push(
              NetworkMessageType.CreateEntity,
              {
                components: [{
                  name: 'position',
                  data: JSON.stringify(root.position.toArray())
                }, {
                  name: 'quaternion',
                  data: JSON.stringify(root.quaternion.toArray())
                }, {
                  name: 'scale',
                  data: JSON.stringify(root.scale.toArray())
                }],
                network_id: networkedProxy.networkId,
                prefab: networkedProxy.prefabName,
                shared: networkedProxy.type === NetworkedType.Shared
              }
            );
          }
        });

        // TODO: Implement properly
        localQuery(world).forEach(localEid => {
          if (hasComponent(world, NetworkedTransform, localEid) &&
            hasComponent(world, EntityObject3D, localEid)) {
            const networkedProxy = NetworkedProxy.get(localEid);
            const root = EntityObject3DProxy.get(localEid).root;
            adapter.push(
              NetworkMessageType.UpdateComponent,
              {
                components: [{
                  name: 'position',
                  data: JSON.stringify(root.position.toArray())
                }, {
                  name: 'quaternion',
                  data: JSON.stringify(root.quaternion.toArray())
                }, {
                  name: 'scale',
                  data: JSON.stringify(root.scale.toArray())
                }],
                network_id: networkedProxy.networkId
              }
            );
          }
        });
      });
    });
  });
};
