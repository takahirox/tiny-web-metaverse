import { Component } from "bitecs";

export enum NetworkMessageType {
  AddComponent = 'add_component',
  CreateEntity = 'create_entity',
  DeleteEntity = 'delete_entity',
  RemoveComponent = 'remove_component',
  TextMessage = 'text_message',
  UpdateComponent = 'update_component',
  UserJoined = 'user_joined'
};

export class NetworkEntityManager {
  private networkIdToEidMap: Map<string, number>;
  private eidToNetworkIdMap: Map<number, string>;
  private deletedNetworkEntities: Set<string>;

  constructor() {	
    this.networkIdToEidMap = new Map();
    this.eidToNetworkIdMap = new Map();
    this.deletedNetworkEntities = new Set();
  }

  register(networkId: string, eid: number): void {
    if (this.deletedEntity(networkId)) {
      return;
    }
    this.networkIdToEidMap.set(networkId, eid);
    this.eidToNetworkIdMap.set(eid, networkId);
  }

  remove(networkId: string): void {
    if (this.deletedEntity(networkId)) {
      return;
    }
    if (!this.networkIdToEidMap.has(networkId)) {
      // TODO: Error handling
      return;
    }
    const eid = this.networkIdToEidMap.get(networkId)!;
    this.networkIdToEidMap.delete(networkId);  
    this.eidToNetworkIdMap.delete(eid);
  }

  deletedEntity(id: string): boolean {
    return this.deletedNetworkEntities.has(id);
  }
}

export class NetworkedComponentManager {
  private nameToComponentMap: Map<string, Component>;
  private componentToNameMap: Map<Component, string>;

  constructor() {
    this.nameToComponentMap = new Map();
    this.componentToNameMap = new Map();
  }

  register(name: string, component: Component): void {
    this.nameToComponentMap.set(name, component);
    this.componentToNameMap.set(component, name);
  }

  deregister(name: string): void {
    if (!this.nameToComponentMap.has(name)) {
      // TODO: Error handling?
      return;
    }
    const component = this.nameToComponentMap.get(name)!;
    this.nameToComponentMap.delete(name);
    this.componentToNameMap.delete(component);
  }
}
