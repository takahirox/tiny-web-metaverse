import { defineComponent, Types } from "bitecs";
import { StateAdapter } from "@tiny-web-metaverse/state_client";
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
type CacheData = any;

type NetworkedComponent = {
  cache: CacheData;
  owner: string;
  updatedAt: number;
  version: number;
};

export const Local = defineComponent();
export const Remote = defineComponent();
export const Shared = defineComponent();

export const Networked = defineComponent();

export class NetworkedProxy {
  private static instance: NetworkedProxy = new NetworkedProxy();
  private eid: number;
  private map: Map<number, {
    components: Map<string, NetworkedComponent>;
    creator: string;
    networkId: string;
    prefabName: string;
    prefabParams: any;
    type: NetworkedType;
  }>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): NetworkedProxy {
    NetworkedProxy.instance.eid = eid;
    return NetworkedProxy.instance;
  }

  // TODO: Avoid any
  allocate(
    networkId: string,
    type: NetworkedType,
    creator: string,
    prefabName: string,
    prefabParams: any
  ): void {
    this.map.set(this.eid, {
      components: new Map<string, NetworkedComponent>(),
      creator,
      networkId,
      prefabName,
      prefabParams,
      type
    });
  }

  free(): void {
    this.map.delete(this.eid);
  }

  hasNetworkedComponent(key: string): boolean {
    return this.map.get(this.eid)!.components.has(key);
  }

  initNetworkedComponent(
    key: string,
    cache: CacheData,
    owner: string,
    updatedAt: number,
    version: number
  ): void {
    this.map.get(this.eid)!.components.set(key, {
      cache,
      owner,
      updatedAt,
      version
    });
  }

  updateNetworkedComponent(
    key: string,
    cache: CacheData,
    owner: string,
    updatedAt: number,
    version: number
  ): void {
    const component = this.map.get(this.eid)!.components.get(key);
    component.cache = cache;
    component.owner = owner;
    component.updatedAt = updatedAt;
    component.version = version;
  }

  getNetworkedComponent(key: string): NetworkedComponent {
    return this.map.get(this.eid)!.components.get(key);
  }

  removeNetworkedComponent(key: string): void {
    this.map.get(this.eid)!.components.delete(key);
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

  get prefabParams(): any {
    return this.map.get(this.eid)!.prefabParams;
  }

  get type(): NetworkedType {
    return this.map.get(this.eid)!.type;
  }
}

export const NetworkedEntityManager = defineComponent();

export class NetworkedEntityManagerProxy {
  private static instance: NetworkedEntityManagerProxy = new NetworkedEntityManagerProxy();
  private eid: number;
  private map: Map<number, {
    deleted: Set<string>;
    eidToNetworkIdMap: Map<number, string>;
    networkIdToEidMap: Map<string, number>;
    networkIdToUserIdMap: Map<string, string>;
    userIdToNetworkIdsMap: Map<string, string[]>;
  }>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): NetworkedEntityManagerProxy {
    NetworkedEntityManagerProxy.instance.eid = eid;
    return NetworkedEntityManagerProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, {
      deleted: new Set(),
      eidToNetworkIdMap: new Map(),
      networkIdToEidMap: new Map(),
      networkIdToUserIdMap: new Map(),
      userIdToNetworkIdsMap: new Map()
    });
  }

  free(): void {
    this.map.delete(this.eid);
  }

  add(eid: number, networkId: string, userId: string): void {
    this.map.get(this.eid).eidToNetworkIdMap.set(eid, networkId);
    this.map.get(this.eid).networkIdToEidMap.set(networkId, eid);

    this.map.get(this.eid).networkIdToUserIdMap.set(networkId, userId);
    if (!this.map.get(this.eid).userIdToNetworkIdsMap.has(userId)) {
      this.map.get(this.eid).userIdToNetworkIdsMap.set(userId, []);
	}
    this.map.get(this.eid).userIdToNetworkIdsMap.get(userId).push(networkId);
  }

  remove(networkId: string): void {
    const eid = this.map.get(this.eid).networkIdToEidMap.get(networkId);
    this.map.get(this.eid).networkIdToEidMap.delete(networkId);
    this.map.get(this.eid).eidToNetworkIdMap.delete(eid);

    const userId = this.map.get(this.eid).networkIdToUserIdMap.get(networkId);
    this.map.get(this.eid).networkIdToUserIdMap.delete(networkId);
    this.map.get(this.eid).userIdToNetworkIdsMap.get(userId).splice(
      this.map.get(this.eid).userIdToNetworkIdsMap.get(userId).indexOf(networkId), 1);

    this.map.get(this.eid).deleted.add(networkId);
  }

  getNetworkId(eid: number): string {
    return this.map.get(this.eid).eidToNetworkIdMap.get(eid)!;
  }

  getNetworkIdsByUserId(userId: string): string[] {
    return this.map.get(this.eid).userIdToNetworkIdsMap.get(userId)!;
  }

  clearNetworkIdsByUserId(userId: string): void {
    while(this.getNetworkIdsByUserId(userId).length > 0) {
      this.remove(this.getNetworkIdsByUserId(userId)[0]);
    }
  }

  getEid(networkId: string): number {
    return this.map.get(this.eid).networkIdToEidMap.get(networkId)!;
  }

  deleted(networkId: string): boolean {
    return this.map.get(this.eid).deleted.has(networkId);
  }
}

export const StateClient = defineComponent();

export class StateClientProxy {
  private static instance: StateClientProxy = new StateClientProxy();
  private eid: number;
  private map: Map<number, StateAdapter>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): StateClientProxy {
    StateClientProxy.instance.eid = eid;
    return StateClientProxy.instance;
  }

  allocate(adapter: StateAdapter): void {
    this.map.set(this.eid, adapter);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get adapter(): StateAdapter {
    return this.map.get(this.eid)!;
  }
}

export const NetworkEvent = defineComponent();

// TODO: Avoid any
type NetworkEventValue = {
  data: any,
  type: NetworkMessageType
};

export class NetworkEventProxy {
  private static instance: NetworkEventProxy = new NetworkEventProxy();
  private eid: number;
  private map: Map<number, NetworkEventValue[]>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): NetworkEventProxy {
    NetworkEventProxy.instance.eid = eid;
    return NetworkEventProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, []);	  
  }

  add(type: NetworkMessageType, data: any): void {
    this.map.get(this.eid)!.push({ data, type });
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get events(): NetworkEventValue[] {
    return this.map.get(this.eid)!;
  }
}

export const NetworkEventReceiver = defineComponent();
export const NetworkEventReceiverReady = defineComponent();

export const TextMessageNetworkEventListener = defineComponent();
export const UserNetworkEventListener = defineComponent();
export const EntityNetworkEventListener = defineComponent();
export const ComponentNetworkEventListener = defineComponent();

export const NetworkEventSender = defineComponent({
  lastSendTime: Types.f32
});

// TODO: Move to NetworkedTransform?
export const NetworkedPosition = defineComponent();
export const NetworkedQuaternion = defineComponent();
export const NetworkedScale = defineComponent();

export const NetworkedMixerAnimation = defineComponent();
