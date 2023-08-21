import {
  addComponent,
  defineComponent,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
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
  version: number;
};

export const Networked = defineComponent();
export const NetworkedReady = defineComponent();

// TODO: Avoid any
type NetworkedValue = {
  components: Map<string, NetworkedComponent>;
  creator: string;
  networkId: string;
  prefabName: string;
  prefabParams: any;
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

  // TODO: Avoid any
  allocate(
    world: IWorld,
    networkId: string,
    type: NetworkedType,
    creator: string,
    prefabName: string,
    prefabParams: any
  ): void {
    addComponent(world, Networked, this.eid);
    this.map.set(this.eid, {
      components: new Map<string, NetworkedComponent>(),
      creator,
      networkId,
      prefabName,
      prefabParams,
      type
    });
  }

  free(world: IWorld): void {
    this.map.delete(this.eid);
    removeComponent(world, Networked, this.eid);
  }

  hasNetworkedComponent(key: string): boolean {
    return this.map.get(this.eid)!.components.has(key);
  }

  initNetworkedComponent(
    key: string,
    cache: CacheData,
    owner: string,
    version: number
  ): void {
    this.map.get(this.eid)!.components.set(key, {
      cache,
      owner,
      version
    });
  }

  updateNetworkedComponent(
    key: string,
    cache: CacheData,
    owner: string,
    version: number
  ): void {
    const component = this.map.get(this.eid)!.components.get(key);
    component.cache = cache;
    component.owner = owner;
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

// TODO: Allow other network adapter type
type StateClientValue = StateAdapter;

export const StateClient = defineComponent();

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

export class StateClientProxy {
  private static instance: StateClientProxy = new StateClientProxy();
  private eid: number;
  private map: Map<number, StateClientValue>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): StateClientProxy {
    StateClientProxy.instance.eid = eid;
    return StateClientProxy.instance;
  }

  allocate(world: IWorld, adapter: StateClientValue): void {
    addComponent(world, StateClient, this.eid);
    this.map.set(this.eid, adapter);
  }

  free(world: IWorld): void {
    this.map.delete(this.eid);
    removeComponent(world, StateClient, this.eid);
  }

  get adapter(): StateClientValue {
    return this.map.get(this.eid)!;
  }
}

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

  add(
    world: IWorld,
    type: NetworkMessageType,
    data: any
  ): void {
    if (!hasComponent(world, NetworkEvent, this.eid)) {
      addComponent(world, NetworkEvent, this.eid);
      this.map.set(this.eid, []);
    }
    this.map.get(this.eid)!.push({data, type});
  }

  free(world: IWorld): void {
    this.map.delete(this.eid);
    removeComponent(world, NetworkEvent, this.eid);
  }

  get events(): NetworkEventValue[] {
    return this.map.get(this.eid)!;
  }
}

export class NetworkEventSenderProxy {
  private static instance: NetworkEventSenderProxy = new NetworkEventSenderProxy();	
  private eid: number;
  private map: Map<number, NetworkEventSenderValue>;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): NetworkEventSenderProxy {
    NetworkEventSenderProxy.instance.eid = eid;
    return NetworkEventSenderProxy.instance;
  }

  allocate(world: IWorld): void {
    addComponent(world, NetworkEventSender, this.eid);
    this.map.set(this.eid, { lastSendTime: 0.0 });
  }

  free(world: IWorld): void {
    this.map.delete(this.eid);
    removeComponent(world, NetworkEventSender, this.eid);
  }

  get lastSendTime(): number {
    return this.map.get(this.eid).lastSendTime;
  }

  set lastSendTime(lastSendTime: number) {
    this.map.get(this.eid).lastSendTime = lastSendTime;
  }
}

export const NetworkedEntityManager = defineComponent();

type NetworkedEntityManagerValue = {
  deleted: Set<string>;
  eidToNetworkIdMap: Map<number, string>;
  networkIdToEidMap: Map<string, number>;
  networkIdToUserIdMap: Map<string, string>;
  userIdToNetworkIdsMap: Map<string, string[]>;
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
      networkIdToEidMap: new Map(),
      networkIdToUserIdMap: new Map(),
      userIdToNetworkIdsMap: new Map()
    });
  }

  free(world: IWorld): void {
    this.map.delete(this.eid);
    removeComponent(world, NetworkedEntityManager, this.eid);
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
