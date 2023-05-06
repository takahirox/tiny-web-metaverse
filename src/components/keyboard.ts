import {
  addComponent,
  defineComponent,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
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
const KeyEventMap = new Map<number, KeyEventValue[]>();

export const KeyEventListener = defineComponent();
export const KeyHold = defineComponent();

export class KeyEventProxy {
  private static instance: KeyEventProxy = new KeyEventProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): KeyEventProxy {
    KeyEventProxy.instance.eid = eid;
    return KeyEventProxy.instance;
  }

  add(world: IWorld, type: KeyEventType, code: number): void {
    if (!hasComponent(world, KeyEvent, this.eid)) {
      addComponent(world, KeyEvent, this.eid);
      KeyEventMap.set(this.eid, []);
    }
    KeyEventMap.get(this.eid)!.push({type, code});
  }

  free(world: IWorld): void {
    removeComponent(world, KeyEvent, this.eid);
    KeyEventMap.delete(this.eid);
  }

  get events(): KeyEventValue[] {
    return KeyEventMap.get(this.eid)!;
  }
}
