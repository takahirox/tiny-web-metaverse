import { defineComponent, IComponent } from "bitecs";
import { NULL_EID, SerializerFunctions } from "../common";

export const Serializers = defineComponent();

export class SerializersProxy {
  private static instance: SerializersProxy = new SerializersProxy();
  private eid: number;
  private map: Map<number, Map<IComponent, SerializerFunctions>>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): SerializersProxy {
    SerializersProxy.instance.eid = eid;
    return SerializersProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, new Map());
  }

  free(): void {
    this.map.delete(this.eid);
  }

  register(component: IComponent, serializers: SerializerFunctions): void {
    this.map.get(this.eid)!.set(component, serializers);
  }

  deregister(component: IComponent): void {
    this.map.get(this.eid)!.delete(component);
  }

  get(component: IComponent): SerializerFunctions {
    return this.map.get(this.eid)!.get(component)!;
  }

  has(component: IComponent): boolean {
    return this.map.get(this.eid)!.has(component)!;
  }
}

export const ComponentKeys = defineComponent();

export class ComponentKeysProxy {
  private static instance: ComponentKeysProxy = new ComponentKeysProxy();
  private eid: number;
  private toComponents: Map<number, Map<string, IComponent>>;
  private toKeys: Map<number, Map<IComponent, string>>;

  private constructor() {
    this.eid = NULL_EID;
    this.toComponents = new Map();
    this.toKeys = new Map();
  }

  static get(eid: number): ComponentKeysProxy {
    ComponentKeysProxy.instance.eid = eid;
    return ComponentKeysProxy.instance;
  }

  allocate(): void {
    this.toComponents.set(this.eid, new Map());
    this.toKeys.set(this.eid, new Map());
  }

  free(): void {
    this.toComponents.delete(this.eid);
    this.toKeys.delete(this.eid);
  }

  register(key: string, component: IComponent): void {
    this.toComponents.get(this.eid).set(key, component);
    this.toKeys.get(this.eid).set(component, key);
  }

  deregister(key: string): void {
    const component = this.toComponents.get(this.eid).get(key);
    this.toComponents.get(this.eid).delete(key);
    this.toKeys.get(this.eid).delete(component);
  }

  getComponent(key: string): IComponent {
    return this.toComponents.get(this.eid)!.get(key);
  }

  hasComponent(key: string): boolean {
    return this.toComponents.get(this.eid)!.has(key);
  }

  getKey(component: IComponent): string {
    return this.toKeys.get(this.eid)!.get(component);
  }

  hasKey(component: IComponent): boolean {
    return this.toKeys.get(this.eid)!.has(component);
  }
}
