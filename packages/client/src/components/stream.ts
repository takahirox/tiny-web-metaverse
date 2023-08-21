import {
  addComponent,
  defineComponent,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import { StreamAdapter } from "@tiny-web-metaverse/stream_client";
import { NULL_EID } from "../common";

export enum StreamMessageType {
  // TODO: Connected, Joined, and Disconnected might not be message.
  //       Make another enum for them?
  Connected = 'connected',
  Joined = 'joined',
  Disconnected = 'disconnected',
  ExitedPeer = 'exitedPeer',
  JoinedPeer = 'joinedPeer',
  LeftPeer = 'leftPeer',
  NewConsumer = 'newConsumer',
  NewPeer = 'newPeer'
};

export const StreamEvent = defineComponent();

export const StreamClient = defineComponent();

export const StreamRemotePeerRegister = defineComponent();

export const StreamNotConnected = defineComponent();
export const StreamConnecting = defineComponent();
export const StreamInLobby = defineComponent();
export const StreamJoining = defineComponent();
export const StreamInRoom = defineComponent();
export const StreamLeaving = defineComponent();

export const StreamConnectRequest = defineComponent();
export const StreamJoinRequest = defineComponent();
export const StreamLeaveRequest = defineComponent();

export const StreamEventReceiver = defineComponent();
export const StreamEventReceiverInit = defineComponent();
export const StreamEventReceiverDestroy = defineComponent();

export const ConnectedStreamEventListener = defineComponent();
export const DisconnectedStreamEventListener = defineComponent();
export const JoinedStreamEventListener = defineComponent();
export const ExitedPeerStreamEventListener = defineComponent();
export const JoinedPeerStreamEventListener = defineComponent();
export const LeftPeerStreamEventListener = defineComponent();
export const NewConsumerStreamEventListener = defineComponent();
export const NewPeerStreamEventListener = defineComponent();

type StreamClientValue = StreamAdapter;

export class StreamClientProxy {
  private static instance: StreamClientProxy = new StreamClientProxy();
  private eid: number;
  private map: Map<number, StreamClientValue>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): StreamClientProxy {
    StreamClientProxy.instance.eid = eid;
    return StreamClientProxy.instance;
  }

  allocate(world: IWorld, adapter: StreamClientValue): void {
    addComponent(world, StreamClient, this.eid);
    this.map.set(this.eid, adapter);
  }

  free(world: IWorld): void {
    this.map.delete(this.eid);
    removeComponent(world, StreamClient, this.eid);
  }

  get adapter(): StreamClientValue {
    return this.map.get(this.eid)!;
  }
}

// TODO: Avoid any
type StreamEventValue = {
  data: any,
  type: StreamMessageType
};

export class StreamEventProxy {
  private static instance: StreamEventProxy = new StreamEventProxy();
  private eid: number;
  private map: Map<number, StreamEventValue[]>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): StreamEventProxy {
    StreamEventProxy.instance.eid = eid;
    return StreamEventProxy.instance;
  }

  add(
    world: IWorld,
    type: StreamMessageType,
    data: any
  ): void {
    if (!hasComponent(world, StreamEvent, this.eid)) {
      addComponent(world, StreamEvent, this.eid);
      this.map.set(this.eid, []);
    }
    this.map.get(this.eid)!.push({data, type});
  }

  free(world: IWorld): void {
    this.map.delete(this.eid);
    removeComponent(world, StreamEvent, this.eid);
  }

  get events(): StreamEventValue[] {
    return this.map.get(this.eid)!;
  }
}

type RemoteStreamPeerValue = {
  audio?: HTMLAudioElement,
  id: string,
  joined: boolean
};

type StreamRemotePeersValue = Map<string /* id */, RemoteStreamPeerValue>;

export const StreamRemotePeers = defineComponent();

export class StreamRemotePeersProxy {
  private static instance: StreamRemotePeersProxy = new StreamRemotePeersProxy();
  private eid: number;
  private map: Map<number, StreamRemotePeersValue>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): StreamRemotePeersProxy {
    StreamRemotePeersProxy.instance.eid = eid;
    return StreamRemotePeersProxy.instance;
  }

  allocate(world: IWorld): void {
    addComponent(world, StreamRemotePeers, this.eid);
    this.map.set(this.eid, new Map());
  }

  free(world: IWorld): void {
    this.map.delete(this.eid);
    removeComponent(world, StreamRemotePeers, this.eid);
  }

  remote(id: string): void {
    this.map.get(this.eid)!.delete(id);
  }

  get peers(): StreamRemotePeersValue {
    return this.map.get(this.eid)!;
  }
}
