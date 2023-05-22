import {
  defineQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  NetworkEvent,
  NetworkEventProxy,
  NetworkEventReceiver,
  NetworkEventReceiverDestroy,
  NetworkEventReceiverInit,
  NetworkEventReceiverInitProxy,
  NetworkEventReceiverProxy,
  NetworkMessageType,
  UserNetworkEventListener
} from "../components/network";

const initQuery = defineQuery([NetworkEventReceiverInit]);
const destroyQuery = defineQuery([NetworkEventReceiver, NetworkEventReceiverDestroy]);
const userListenerQuery = defineQuery([UserNetworkEventListener]);
const eventQuery = defineQuery([NetworkEvent]);

// TODO: Avoid any
const addEvent = (
  world: IWorld,
  eid: number,
  type: NetworkMessageType,
  payload: any
): void => {
  NetworkEventProxy.get(eid).add(
    world,
    type,
    payload.version,
    payload.data
  );
};

export const networkEventHandleSystem = (world: IWorld) => {
  destroyQuery(world).forEach(eid => {
    const proxy = NetworkEventReceiverProxy.get(eid);
    const adapter = proxy.adapter;
    adapter.removeEventListener(NetworkMessageType.UserJoined);
    adapter.removeEventListener(NetworkMessageType.UserLeft);
    proxy.free(world);

    removeComponent(world, NetworkEventReceiverDestroy, eid);
  });

  initQuery(world).forEach(eid => {
    const proxy = NetworkEventReceiverInitProxy.get(eid);
    const adapter = proxy.adapter;
    proxy.free(world);

    adapter.addEventListener(NetworkMessageType.UserJoined, (payload) => {
      // TODO: Check world is still alive?
      userListenerQuery(world).forEach(eid => {
        addEvent(world, eid, NetworkMessageType.UserJoined, payload);
      });
    });

    adapter.addEventListener(NetworkMessageType.UserLeft, (payload) => {
      userListenerQuery(world).forEach(eid => {
        addEvent(world, eid, NetworkMessageType.UserLeft, payload);
      });
    });

    NetworkEventReceiverProxy.get(eid).allocate(world, adapter);
  });
};

export const networkEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    NetworkEventProxy.get(eid).free(world);
  });
};