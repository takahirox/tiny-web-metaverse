import {
  defineQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  ConnectedStreamEventListener,
  DisconnectedStreamEventListener,
  ExitedPeerStreamEventListener,
  JoinedStreamEventListener,
  JoinedPeerStreamEventListener,
  LeftPeerStreamEventListener,
  NewConsumerStreamEventListener,
  NewPeerStreamEventListener,
  StreamClient,
  StreamClientProxy,
  StreamEvent,
  StreamEventProxy,
  StreamEventReceiver,
  StreamEventReceiverDestroy,
  StreamEventReceiverInit,
  StreamMessageType
} from "../components/stream";

const initQuery = defineQuery([StreamEventReceiverInit]);
const destroyQuery = defineQuery([StreamEventReceiver, StreamEventReceiverDestroy]);

const connectedListenerQuery = defineQuery([ConnectedStreamEventListener]);
const joinedListenerQuery = defineQuery([JoinedStreamEventListener]);
const disconnectedListenerQuery = defineQuery([DisconnectedStreamEventListener]);
const exitedPeerListenerQuery = defineQuery([ExitedPeerStreamEventListener]);
const joinedPeerListenerQuery = defineQuery([JoinedPeerStreamEventListener]);
const leftPeerListenerQuery = defineQuery([LeftPeerStreamEventListener]);
const newConsumerListenerQuery = defineQuery([NewConsumerStreamEventListener]);
const newPeerListenerQuery = defineQuery([NewPeerStreamEventListener]);
const eventQuery = defineQuery([StreamEvent]);
const adapterQuery = defineQuery([StreamClient]);

// TODO: Avoid any
const addEvent = (
  world: IWorld,
  eid: number,
  type: StreamMessageType,
  payload: any
): void => {
  StreamEventProxy.get(eid).add(
    world,
    type,
    payload
  );
};

// TODO: This system may be simpler if adapter is passed via system data
export const streamEventHandleSystem = (world: IWorld) => {
  // Assumes that adapter entities are same as the ones that
  // receivers are initialized with
  destroyQuery(world).forEach(eid => {
    const adapterEids = adapterQuery(world);

    if (adapterEids.length === 0) {
      return;
    }

    adapterEids.forEach(adapterEid => {
      const adapter = StreamClientProxy.get(adapterEid).adapter;

      adapter.off(StreamMessageType.Connected);
      adapter.off(StreamMessageType.Joined);
      adapter.off(StreamMessageType.Disconnected);
      adapter.off(StreamMessageType.ExitedPeer);
      adapter.off(StreamMessageType.JoinedPeer);
      adapter.off(StreamMessageType.LeftPeer);
      adapter.off(StreamMessageType.NewConsumer);
      adapter.off(StreamMessageType.NewPeer);
    });

    removeComponent(world, StreamEventReceiverDestroy, eid);
    removeComponent(world, StreamEventReceiver, eid);
  });

  // Assumes that adapter entity is not added after receiver initialization
  initQuery(world).forEach(eid => {
    const adapterEids = adapterQuery(world);

    if (adapterEids.length === 0) {
      return;
    }

    adapterEids.forEach(adapterEid => {
      const adapter = StreamClientProxy.get(adapterEid).adapter;

      // TODO: Validate data?

      adapter.on(StreamMessageType.Connected, (payload) => {
        // TODO: Check world is still alive?
        connectedListenerQuery(world).forEach(eid => {
          addEvent(world, eid, StreamMessageType.Connected, payload);
        });
      });

      adapter.on(StreamMessageType.Joined, (payload) => {
        joinedListenerQuery(world).forEach(eid => {
          addEvent(world, eid, StreamMessageType.Joined, payload);
        });
      });

      adapter.on(StreamMessageType.Disconnected, (payload) => {
        disconnectedListenerQuery(world).forEach(eid => {
          addEvent(world, eid, StreamMessageType.Disconnected, payload);
        });
      });

      adapter.on(StreamMessageType.ExitedPeer, (payload) => {
        exitedPeerListenerQuery(world).forEach(eid => {
          addEvent(world, eid, StreamMessageType.ExitedPeer, payload);
        });
      });

      adapter.on(StreamMessageType.JoinedPeer, (payload) => {
        joinedPeerListenerQuery(world).forEach(eid => {
          addEvent(world, eid, StreamMessageType.JoinedPeer, payload);
        });
      });

      adapter.on(StreamMessageType.LeftPeer, (payload) => {
        leftPeerListenerQuery(world).forEach(eid => {
          addEvent(world, eid, StreamMessageType.LeftPeer, payload);
        });
      });

      adapter.on(StreamMessageType.NewConsumer, (payload) => {
        newConsumerListenerQuery(world).forEach(eid => {
          addEvent(world, eid, StreamMessageType.NewConsumer, payload);
        });
      });

      adapter.on(StreamMessageType.NewPeer, (payload) => {
        newPeerListenerQuery(world).forEach(eid => {
          addEvent(world, eid, StreamMessageType.NewPeer, payload);
        });
      });
    });

    removeComponent(world, StreamEventReceiverInit, eid);
  });
};

export const streamEventClearSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    StreamEventProxy.get(eid).free(world);
  });
};
