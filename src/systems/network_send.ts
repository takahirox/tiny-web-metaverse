import { defineQuery, IWorld } from "bitecs";
import {
  NetworkEventSender,
  NetworkEventSenderProxy,
  NetworkEventSendQueue,
  NetworkEventSendQueueProxy
} from "../components/network";

const senderQuery = defineQuery([NetworkEventSender]);
const queueQuery = defineQuery([NetworkEventSendQueue]);

export const networkSendSystem = (world: IWorld) => {
  senderQuery(world).forEach(senderEid => {
    const adapter = NetworkEventSenderProxy.get(senderEid).adapter;
    queueQuery(world).forEach(queueEid => {
      // TODO: Merge events?
      for (const e of NetworkEventSendQueueProxy.get(queueEid).events) {
        adapter.push(e.type, e.data);
      }
    });
  });
};

export const networkSendQueueClearSystem = (world: IWorld) => {
  queueQuery(world).forEach(eid => {
    NetworkEventSendQueueProxy.get(eid).clear();
  });
};