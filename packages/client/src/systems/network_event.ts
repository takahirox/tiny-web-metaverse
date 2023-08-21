import {
  defineQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  ComponentNetworkEventListener,
  EntityNetworkEventListener,
  NetworkEvent,
  NetworkEventProxy,
  NetworkEventReceiver,
  NetworkEventReceiverDestroy,
  NetworkEventReceiverInit,
  NetworkMessageType,
  StateClient,
  StateClientProxy,
  UserNetworkEventListener
} from "../components/network";

const initQuery = defineQuery([NetworkEventReceiverInit]);
const destroyQuery = defineQuery([NetworkEventReceiver, NetworkEventReceiverDestroy]);
const userListenerQuery = defineQuery([UserNetworkEventListener]);
const entityListenerQuery = defineQuery([EntityNetworkEventListener]);
const componentListenerQuery = defineQuery([ComponentNetworkEventListener]);
const eventQuery = defineQuery([NetworkEvent]);
const adapterQuery = defineQuery([StateClient]);

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
    payload.data
  );
};

// TODO: This system may be simpler if adapter is passed via system data
export const networkEventHandleSystem = (world: IWorld) => {
  // Assumes that adapter entities are same as the ones that
  // receivers are initialized with
  destroyQuery(world).forEach(eid => {
    const adapterEids = adapterQuery(world);

    if (adapterEids.length === 0) {
      return;
    }

    adapterEids.forEach(adapterEid => {
      const adapter = StateClientProxy.get(adapterEid).adapter;

      adapter.removeEventListener(NetworkMessageType.UserJoined);
      adapter.removeEventListener(NetworkMessageType.UserLeft);
      adapter.removeEventListener(NetworkMessageType.CreateEntity);
      adapter.removeEventListener(NetworkMessageType.RemoveEntity);
      adapter.removeEventListener(NetworkMessageType.AddComponent);
    });

    removeComponent(world, NetworkEventReceiverDestroy, eid);
    removeComponent(world, NetworkEventReceiver, eid);
  });

  // Assumes that adapter entity is not added after receiver initialization
  initQuery(world).forEach(eid => {
    const adapterEids = adapterQuery(world);

    if (adapterEids.length === 0) {
      return;
    }

    adapterEids.forEach(adapterEid => {
      const adapter = StateClientProxy.get(adapterEid).adapter;

      // TODO: Validate network data?

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

      adapter.addEventListener(NetworkMessageType.CreateEntity, (payload) => {
        entityListenerQuery(world).forEach(eid => {
          addEvent(world, eid, NetworkMessageType.CreateEntity, payload);
        });
      });

      adapter.addEventListener(NetworkMessageType.RemoveEntity, (payload) => {
        entityListenerQuery(world).forEach(eid => {
          addEvent(world, eid, NetworkMessageType.RemoveEntity, payload);
        });
      });

      adapter.addEventListener(NetworkMessageType.UpdateComponent, (payload) => {
        componentListenerQuery(world).forEach(eid => {
          addEvent(world, eid, NetworkMessageType.UpdateComponent, payload);
        });
      });
    });

    removeComponent(world, NetworkEventReceiverInit, eid);
  });
};

export const networkEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    NetworkEventProxy.get(eid).free(world);
  });
};