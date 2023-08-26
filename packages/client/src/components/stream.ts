import { defineComponent } from "bitecs";
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

export const StreamClient = defineComponent();

export class StreamClientProxy {
  private static instance: StreamClientProxy = new StreamClientProxy();
  private eid: number;
  private map: Map<number, StreamAdapter>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): StreamClientProxy {
    StreamClientProxy.instance.eid = eid;
    return StreamClientProxy.instance;
  }

  allocate(adapter: StreamAdapter): void {
    this.map.set(this.eid, adapter);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get adapter(): StreamAdapter {
    return this.map.get(this.eid)!;
  }
}

export const StreamConnectRequestor = defineComponent();
export const StreamJoinRequestor = defineComponent();
export const StreamLeaveRequestor = defineComponent();

export const StreamEvent = defineComponent();

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

  allocate(): void {
    this.map.set(this.eid, []);
  }

  add(type: StreamMessageType, data: any): void {
    this.map.get(this.eid)!.push({data, type});
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get events(): StreamEventValue[] {
    return this.map.get(this.eid)!;
  }
}

export const StreamEventReceiver = defineComponent();
export const StreamEventReceiverReady = defineComponent();

export const ConnectedStreamEventListener = defineComponent();
export const DisconnectedStreamEventListener = defineComponent();
export const JoinedStreamEventListener = defineComponent();
export const ExitedPeerStreamEventListener = defineComponent();
export const JoinedPeerStreamEventListener = defineComponent();
export const LeftPeerStreamEventListener = defineComponent();
export const NewConsumerStreamEventListener = defineComponent();
export const NewPeerStreamEventListener = defineComponent();

export const StreamRemotePeers = defineComponent();

type StreamRemotePeersValue = Map<string /* id */, {
  audio?: HTMLAudioElement,
  id: string,
  joined: boolean
}>;

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

  allocate(): void {
    this.map.set(this.eid, new Map());
  }

  free(): void {
    this.map.delete(this.eid);
  }

  remove(id: string): void {
    this.map.get(this.eid)!.delete(id);
  }

  get peers(): StreamRemotePeersValue {
    return this.map.get(this.eid)!;
  }
}

export const StreamRemotePeerRegister = defineComponent();
