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

type KeyEventHandlerValue = {
  keydownListener: (event: KeyboardEvent) => void;
  keyupListener: (event: KeyboardEvent) => void;
};

export const KeyEventHandlerInit = defineComponent();
export const KeyEventHandler = defineComponent();
const KeyEventHandlerMap = new Map<number, KeyEventHandlerValue>();

// TODO: Rename
export type KeyEventValue = {
  code: number;
  type: KeyEventType;
};

export const KeyEvent = defineComponent();
const KeyEventMap = new Map<number, KeyEventValue[]>();

export const KeyEventListener = defineComponent();
export const KeyHold = defineComponent();

export class KeyEventHandlerProxy {
  private static instance: KeyEventHandlerProxy = new KeyEventHandlerProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): KeyEventHandlerProxy {
    KeyEventHandlerProxy.instance.eid = eid;
    return KeyEventHandlerProxy.instance;
  }

  allocate(
    world: IWorld,
    keydownListener: (event: KeyboardEvent) => void,
    keyupListener: (event: KeyboardEvent) => void
  ): void {
    addComponent(world, KeyEventHandler, this.eid);
    KeyEventHandlerMap.set(this.eid, {
      keydownListener,
      keyupListener
    });
  }

  free(world: IWorld): void {
    removeComponent(world, KeyEventHandler, this.eid);
    KeyEventHandlerMap.delete(this.eid);
  }

  get keydownListener(): (event: KeyboardEvent) => void {
    return KeyEventHandlerMap.get(this.eid).keydownListener;
  }

  get keyupListener(): (event: KeyboardEvent) => void {
    return KeyEventHandlerMap.get(this.eid).keyupListener;
  }
}

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
