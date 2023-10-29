import { defineComponent } from "bitecs";
import { NULL_EID } from "../common";

export enum KeyEventType {
  Down,
  Up
};

// TODO: Rename
export type KeyEventValue = {
  code: number;
  type: KeyEventType;
};

export const KeyEvent = defineComponent();

export class KeyEventProxy {
  private static instance: KeyEventProxy = new KeyEventProxy();
  private eid: number;
  private map: Map<number, KeyEventValue[]>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): KeyEventProxy {
    KeyEventProxy.instance.eid = eid;
    return KeyEventProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, []);  
  }

  add(type: KeyEventType, code: number): void {
    this.map.get(this.eid)!.push({type, code});
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get events(): KeyEventValue[] {
    return this.map.get(this.eid)!;
  }
}

export const KeyEventListener = defineComponent();
export const KeyHold = defineComponent();
