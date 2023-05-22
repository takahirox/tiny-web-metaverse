import {
  addComponent,
  defineComponent,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import { PhoenixAdapter } from "../utils/phoenix_adapter";
import { NULL_EID } from "../common";

export const Networked = defineComponent();
export const NetworkedTransform = defineComponent();

type NetworkedValue = {
  networkId: string;
};

const NetworkedMap = new Map<number, NetworkedValue>();

export const Local = defineComponent();
export const Remote = defineComponent();
export const Shared = defineComponent();

export enum NetworkMessageType {
  AddComponent = 'add_component',
  CreateEntity = 'create_entity',
  DeleteEntity = 'delete_entity',
  RemoveComponent = 'remove_component',
  TextMessage = 'text_message',
  UpdateComponent = 'update_component',
  UserJoined = 'user_joined',
  UserLeft = 'user_left'
};

// TODO: Avoid any
type NetworkEventValue = {
  data: any,
  type: NetworkMessageType,
  version: number
};

export const NetworkEvent = defineComponent();
const NetworkEventMap = new Map<number, NetworkEventValue[]>();

// TODO: Allow other network adapter type
type NetworkAdapter = PhoenixAdapter;

type NetworkEventReceiverInitValue = {
  adapter: NetworkAdapter;
};

type NetworkEventReceiverValue = {
  adapter: NetworkAdapter;
};

export const NetworkEventReceiver = defineComponent();
export const NetworkEventReceiverInit = defineComponent();
export const NetworkEventReceiverDestroy = defineComponent();
const NetworkEventReceiverInitMap = new Map<number, NetworkEventReceiverInitValue>();
const NetworkEventReceiverMap = new Map<number, NetworkEventReceiverValue>();

export const TextMessageNetworkEventListener = defineComponent();
export const UserNetworkEventListener = defineComponent();
export const EntityNetworkEventListener = defineComponent();

export const NetworkEventSender = defineComponent();
export const NetworkEventSenderInit = defineComponent();
export const NetworkEventSenderDestroy = defineComponent();

export class NetworkedProxy {
  private static instance: NetworkedProxy = new NetworkedProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): NetworkedProxy {
    NetworkedProxy.instance.eid = eid;
    return NetworkedProxy.instance;
  }

  allocate(world: IWorld, networkId: string): void {
    addComponent(world, NetworkedProxy, this.eid);
    NetworkedMap.set(this.eid, {networkId});
  }

  free(world: IWorld): void {
    NetworkedMap.delete(this.eid);
    removeComponent(world, NetworkedProxy, this.eid);
  }
}

export class NetworkEventProxy {
  private static instance: NetworkEventProxy = new NetworkEventProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): NetworkEventProxy {
    NetworkEventProxy.instance.eid = eid;
    return NetworkEventProxy.instance;
  }

  add(
    world: IWorld,
    type: NetworkMessageType,
    version: number,
    data: any
  ): void {
    if (!hasComponent(world, NetworkEvent, this.eid)) {
      addComponent(world, NetworkEvent, this.eid);
      NetworkEventMap.set(this.eid, []);
    }
    NetworkEventMap.get(this.eid)!.push({data, type, version});
  }

  free(world: IWorld): void {
    NetworkEventMap.delete(this.eid);
    removeComponent(world, NetworkEventProxy, this.eid);
  }

  get events(): NetworkEventValue[] {
    return NetworkEventMap.get(this.eid)!;
  }
}

export class NetworkEventReceiverInitProxy {
  private static instance: NetworkEventReceiverInitProxy = new NetworkEventReceiverInitProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): NetworkEventReceiverInitProxy {
    NetworkEventReceiverInitProxy.instance.eid = eid;
    return NetworkEventReceiverInitProxy.instance;
  }

  allocate(world: IWorld, adapter: NetworkAdapter): void {
    addComponent(world, NetworkEventReceiverInit, this.eid);
    NetworkEventReceiverInitMap.set(this.eid, {adapter});
  }

  free(world: IWorld): void {
    NetworkEventReceiverInitMap.delete(this.eid);
    removeComponent(world, NetworkEventReceiverInit, this.eid);
  }

  get adapter(): NetworkAdapter {
    return NetworkEventReceiverInitMap.get(this.eid)!.adapter;
  }
}

export class NetworkEventReceiverProxy {
  private static instance: NetworkEventReceiverProxy = new NetworkEventReceiverProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): NetworkEventReceiverProxy {
    NetworkEventReceiverProxy.instance.eid = eid;
    return NetworkEventReceiverProxy.instance;
  }

  allocate(world: IWorld, adapter: NetworkAdapter): void {
    addComponent(world, NetworkEventReceiver, this.eid);
    NetworkEventReceiverMap.set(this.eid, {adapter});
  }

  free(world: IWorld): void {
    NetworkEventReceiverMap.delete(this.eid);
    removeComponent(world, NetworkEventReceiver, this.eid);
  }

  get adapter(): NetworkAdapter {
    return NetworkEventReceiverMap.get(this.eid)!.adapter;
  }
}

export class NetworkEventSenderProxy {
  private static instance: NetworkEventSenderProxy = new NetworkEventSenderProxy();	
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): NetworkEventSenderProxy {
    NetworkEventSenderProxy.instance.eid = eid;
    return NetworkEventSenderProxy.instance;
  }

  allocate(world: IWorld): void {
    addComponent(world, NetworkEventSender, this.eid);
  }

  free(world: IWorld): void {
    removeComponent(world, NetworkEventSender, this.eid);
  }
}
