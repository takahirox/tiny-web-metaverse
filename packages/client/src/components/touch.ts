import { defineComponent } from "bitecs";
import { NULL_EID } from "../../src/common";

export enum TouchEventType {
  Cancel,
  End,
  Start
};

// TODO: Number of points support?

// TODO: Rename
export type TouchEventValue = {
  type: TouchEventType;
  x: number;
  y: number;
};

export const TouchEvent = defineComponent();
export const TouchEventListener = defineComponent();
export const TouchHold = defineComponent();

export class TouchEventProxy {
  private static instance: TouchEventProxy = new TouchEventProxy();
  private eid: number;
  private map: Map<number, TouchEventValue[]>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): TouchEventProxy {
    TouchEventProxy.instance.eid = eid;
    return TouchEventProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, []);
  }

  add(
    type: TouchEventType,
    x: number,
    y: number
  ): void {
    this.map.get(this.eid)!.push({type, x, y});
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get events(): TouchEventValue[] {
    return this.map.get(this.eid)!;
  }
}

export const TouchMoveEvent = defineComponent();
export const TouchMoveEventListener = defineComponent();

export type TouchMoveEventValue = {
  x: number;
  y: number;
};

export class TouchMoveEventProxy {
  private static instance: TouchMoveEventProxy = new TouchMoveEventProxy();
  private eid: number;
  private map: Map<number, TouchMoveEventValue[]>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): TouchMoveEventProxy {
    TouchMoveEventProxy.instance.eid = eid;
    return TouchMoveEventProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, []);
  }

  add(x: number, y: number): void {
    this.map.get(this.eid)!.push({x, y});
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get events(): TouchMoveEventValue[] {
    return this.map.get(this.eid)!;
  }
}

export const TouchEventHandler = defineComponent();
export const TouchEventHandlerReady = defineComponent();

export class TouchEventHandlerProxy {
  private static instance: TouchEventHandlerProxy = new TouchEventHandlerProxy();
  private eid: number;
  private targets: Map<number, HTMLElement>;
  private listeners: Map<number, {
    touchcancelListener: (event: TouchEvent) => void;
    touchendListener: (event: TouchEvent) => void;
    touchstartListener: (event: TouchEvent) => void;
  }>;

  private constructor() {
    this.eid = NULL_EID;
    this.targets = new Map();
    this.listeners = new Map();
  }

  static get(eid: number): TouchEventHandlerProxy {
    TouchEventHandlerProxy.instance.eid = eid;
    return TouchEventHandlerProxy.instance;
  }

  init(target: HTMLElement): void {
    this.targets.set(this.eid, target);
  }

  allocate(
    touchstartListener: (event: TouchEvent) => void,
    touchendListener: (event: TouchEvent) => void,
    touchcancelListener: (event: TouchEvent) => void
  ): void {
    this.listeners.set(this.eid, {
      touchcancelListener,
      touchendListener,
      touchstartListener
    });
  }

  free(): void {
    this.targets.delete(this.eid);
    this.listeners.delete(this.eid);
  }

  get target(): HTMLElement {
    return this.targets.get(this.eid)!;
  }

  get touchcancelListener(): (event: TouchEvent) => void {
    return this.listeners.get(this.eid)!.touchcancelListener;
  }

  get touchendListener(): (event: TouchEvent) => void {
    return this.listeners.get(this.eid)!.touchendListener;
  }

  get touchstartListener(): (event: TouchEvent) => void {
    return this.listeners.get(this.eid)!.touchstartListener;
  }

  get alive(): boolean {
    return this.targets.has(this.eid) || this.listeners.has(this.eid);
  }

  get listenersAlive(): boolean {
    return this.listeners.has(this.eid);
  }
}

export const TouchMoveEventHandler = defineComponent();
export const TouchMoveEventHandlerReady = defineComponent();

export class TouchMoveEventHandlerProxy {
  private static instance: TouchMoveEventHandlerProxy = new TouchMoveEventHandlerProxy();
  private eid: number;
  private targets: Map<number, HTMLElement>;
  private listeners: Map<number, (event: TouchEvent) => void>;

  private constructor() {
    this.eid = NULL_EID;
    this.targets = new Map();
    this.listeners = new Map();
  }

  static get(eid: number): TouchMoveEventHandlerProxy {
    TouchMoveEventHandlerProxy.instance.eid = eid;
    return TouchMoveEventHandlerProxy.instance;
  }

  init(target: HTMLElement): void {
    this.targets.set(this.eid, target);
  }

  allocate(listener: (event: TouchEvent) => void): void {
    this.listeners.set(this.eid, listener);
  }

  free(): void {
    this.targets.delete(this.eid);
    this.listeners.delete(this.eid);
  }

  get listener(): (event: TouchEvent) => void {
    return this.listeners.get(this.eid)!;
  }

  get target(): HTMLElement {
    return this.targets.get(this.eid)!;
  }

  get alive(): boolean {
    return this.targets.has(this.eid) || this.listeners.has(this.eid);
  }

  get listenersAlive(): boolean {
    return this.listeners.has(this.eid);
  }
}

export const TouchPosition = defineComponent();

export class TouchPositionProxy {
  private static instance: TouchPositionProxy = new TouchPositionProxy();
  private eid: number;
  private map: Map<number, { x: number, y: number }>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): TouchPositionProxy {
    TouchPositionProxy.instance.eid = eid;
    return TouchPositionProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, { x: 0, y: 0 });
  }

  free(): void {
    this.map.delete(this.eid);
  }

  update(x: number, y: number): void {
    const values = this.map.get(this.eid)!;
    values.x = x;
    values.y = y;
  }

  get x(): number {
    return this.map.get(this.eid)!.x;
  }

  get y(): number {
    return this.map.get(this.eid)!.y;
  }
}
