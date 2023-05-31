import {
  addComponent,
  defineComponent,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import { PhoenixAdapter } from "../utils/phoenix_adapter";
import { NULL_EID } from "../common";

export enum NetworkMessageType {
  AddComponent = 'add_component',
  CreateEntity = 'create_entity',
  RemoveEntity = 'remove_entity',
  RemoveComponent = 'remove_component',
  TextMessage = 'text_message',
  UpdateComponent = 'update_component',
  UserJoined = 'user_joined',
  UserLeft = 'user_left',
  UserList = 'user_list'
};

export enum NetworkedType {
  Local = 'local',
  Remote = 'remote',
  Shared = 'shared'
};

// TODO: Avoid any
type NetworkedComponentData = {
  data: any;
  version: number;
};

export const Networked = defineComponent();

type NetworkedValue = {
  // TODO: Avoid any
  cache: Map<string, any>;
  components: Map<string, NetworkedComponentData>;
  creator: string;
  networkId: string;
  prefabName: string;
  type: NetworkedType;
};

export class NetworkedProxy {
  private static instance: NetworkedProxy = new NetworkedProxy();
  private eid: number;
  private map: Map<number, NetworkedValue>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): NetworkedProxy {
    NetworkedProxy.instance.eid = eid;
    return NetworkedProxy.instance;
  }

  allocate(
    world: IWorld,
    networkId: string,
    type: NetworkedType,
    creator: string,
    prefabName: string
  ): void {
    addComponent(world, Networked, this.eid);
    this.map.set(this.eid, {
      components: new Map<string, NetworkedComponentData>(),
      creator,
      networkId,
      prefabName,
      type,
      cache: new Map()
    });
  }

  free(world: IWorld): void {
    this.map.delete(this.eid);
    removeComponent(world, Networked, this.eid);
  }

  hasCache(key: string): boolean {
    return this.map.get(this.eid)!.cache.has(key);
  }

  getCache(key: string): any {
    return this.map.get(this.eid)!.cache.get(key);
  }

　　setCache(key: string, cache: any): void {
    this.map.get(this.eid)!.cache.set(key, cache);
  }

  get creator(): string {
    return this.map.get(this.eid)!.creator;
  }

  get networkId(): string {
    return this.map.get(this.eid)!.networkId;
  }

  get prefabName(): string {
    return this.map.get(this.eid)!.prefabName;
  }

  get type(): NetworkedType {
    return this.map.get(this.eid)!.type;
  }
}

export const NetworkedInit = defineComponent();

type NetworkedInitValue = {
  networkId: string;
  prefabName: string;
};

export class NetworkedInitProxy {
  private static instance: NetworkedInitProxy = new NetworkedInitProxy();
  private eid: number;
  private map: Map<number, NetworkedInitValue>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): NetworkedInitProxy {
    NetworkedInitProxy.instance.eid = eid;
    return NetworkedInitProxy.instance;
  }

  allocate(world: IWorld, networkId: string, prefabName: string): void {
    addComponent(world, NetworkedInit, this.eid);
    this.map.set(this.eid, {networkId, prefabName});
  }

  free(world: IWorld): void {
    this.map.delete(this.eid);
    removeComponent(world, NetworkedInit, this.eid);
  }

  get networkId(): string {
    return this.map.get(this.eid)!.networkId;
  }

  get prefabName(): string {
    return this.map.get(this.eid)!.prefabName;
  }
}

export const Local = defineComponent();
export const Remote = defineComponent();
export const Shared = defineComponent();

export const NetworkedPosition = defineComponent();
export const NetworkedQuaternion = defineComponent();
export const NetworkedScale = defineComponent();

// TODO: Avoid any
type NetworkEventValue = {
  data: any,
  type: NetworkMessageType
};

export const NetworkEvent = defineComponent();
const NetworkEventMap = new Map<number, NetworkEventValue[]>();

// TODO: Allow other network adapter type
type NetworkAdapterValue = PhoenixAdapter;

export const NetworkAdapter = defineComponent();
const NetworkAdapterMap = new Map<number, NetworkAdapterValue>;

export const NetworkEventReceiver = defineComponent();
export const NetworkEventReceiverInit = defineComponent();
export const NetworkEventReceiverDestroy = defineComponent();

export const TextMessageNetworkEventListener = defineComponent();
export const UserNetworkEventListener = defineComponent();
export const EntityNetworkEventListener = defineComponent();
export const ComponentNetworkEventListener = defineComponent();

type NetworkEventSenderValue = {
  lastSendTime: number;
};

export const NetworkEventSender = defineComponent();
const NetworkEventSenderMap = new Map<number, NetworkEventSenderValue>();

export class NetworkAdapterProxy {
  private static instance: NetworkAdapterProxy = new NetworkAdapterProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): NetworkAdapterProxy {
    NetworkAdapterProxy.instance.eid = eid;
    return NetworkAdapterProxy.instance;
  }

  allocate(world: IWorld, adapter: NetworkAdapterValue): void {
    addComponent(world, NetworkAdapter, this.eid);
    NetworkAdapterMap.set(this.eid, adapter);
  }

  free(world: IWorld): void {
    NetworkAdapterMap.delete(this.eid);
    removeComponent(world, NetworkAdapter, this.eid);
  }

  get adapter(): NetworkAdapterValue {
    return NetworkAdapterMap.get(this.eid)!;
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
    data: any
  ): void {
    if (!hasComponent(world, NetworkEvent, this.eid)) {
      addComponent(world, NetworkEvent, this.eid);
      NetworkEventMap.set(this.eid, []);
    }
    NetworkEventMap.get(this.eid)!.push({data, type});
  }

  free(world: IWorld): void {
    NetworkEventMap.delete(this.eid);
    removeComponent(world, NetworkEvent, this.eid);
  }

  get events(): NetworkEventValue[] {
    return NetworkEventMap.get(this.eid)!;
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
    NetworkEventSenderMap.set(this.eid, { lastSendTime: 0.0 });
  }

  free(world: IWorld): void {
    NetworkEventSenderMap.delete(this.eid);
    removeComponent(world, NetworkEventSender, this.eid);
  }

  get lastSendTime(): number {
    return NetworkEventSenderMap.get(this.eid).lastSendTime;
  }

  set lastSendTime(lastSendTime: number) {
    NetworkEventSenderMap.get(this.eid).lastSendTime = lastSendTime;
  }
}

export const NetworkedEntityManager = defineComponent();

type NetworkedEntityManagerValue = {
  networkIdToEidMap: Map<string, number>;
  eidToNetworkIdMap: Map<number, string>;
  deleted: Set<string>;
};

export class NetworkedEntityManagerProxy {
  private static instance: NetworkedEntityManagerProxy = new NetworkedEntityManagerProxy();
  private eid: number;
  private map: Map<number, NetworkedEntityManagerValue>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): NetworkedEntityManagerProxy {
    NetworkedEntityManagerProxy.instance.eid = eid;
    return NetworkedEntityManagerProxy.instance;
  }

  allocate(world: IWorld): void {
    addComponent(world, NetworkedEntityManager, this.eid);
    this.map.set(this.eid, {
      deleted: new Set(),
      eidToNetworkIdMap: new Map(),
      networkIdToEidMap: new Map()
    });
  }

  free(world: IWorld): void {
    this.map.delete(this.eid);
    removeComponent(world, NetworkedEntityManager, this.eid);
  }

  add(eid: number, networkId: string): void {
    this.map.get(this.eid).eidToNetworkIdMap.set(eid, networkId);
    this.map.get(this.eid).networkIdToEidMap.set(networkId, eid);
  }

  remove(networkId: string): void {
    const eid = this.map.get(this.eid).networkIdToEidMap.get(networkId);
    this.map.get(this.eid).networkIdToEidMap.delete(networkId);
    this.map.get(this.eid).eidToNetworkIdMap.delete(eid);
    this.map.get(this.eid).deleted.add(networkId);
  }

  getNetworkId(eid: number): string {
    return this.map.get(this.eid).eidToNetworkIdMap.get(eid)!;
  }

  getEid(networkId: string): number {
    return this.map.get(this.eid).networkIdToEidMap.get(networkId)!;
  }

  deleted(networkId: string): boolean {
    return this.map.get(this.eid).deleted.has(networkId);
  }
}
