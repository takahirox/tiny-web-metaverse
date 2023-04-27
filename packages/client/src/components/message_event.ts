import { defineComponent } from "bitecs";
import { NULL_EID } from "../common";

export const MessageSender = defineComponent();

export class MessageSenderProxy {
  private static instance: MessageSenderProxy = new MessageSenderProxy();
  private eid: number;
  // TODO: Avoid any if possible
  private map: Map<number, any>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): MessageSenderProxy {
    MessageSenderProxy.instance.eid = eid;
    return MessageSenderProxy.instance;
  }

  allocate(data: any): void {
    this.map.set(this.eid, data);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get data(): any {
    return this.map.get(this.eid)!;
  }
}

export const MessageEvent = defineComponent();

// TODO: Avoid any
type MessageEventValue = {
  data: any
};

export class MessageEventProxy {
  private static instance: MessageEventProxy = new MessageEventProxy();
  private eid: number;
  private map: Map<number, MessageEventValue[]>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): MessageEventProxy {
    MessageEventProxy.instance.eid = eid;
    return MessageEventProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, []);
  }

  add(data: any): void {
    this.map.get(this.eid)!.push(data);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get events(): MessageEventValue[] {
    return this.map.get(this.eid)!;
  }
}

export const MessageEventListener = defineComponent();
