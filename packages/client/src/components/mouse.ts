import { defineComponent } from "bitecs";
import { NULL_EID } from "../../src/common";

export enum MouseButtonEventType {
  Down,
  Up
};

export enum MouseButtonType {
  Left,
  Middle,
  Right
};

// TODO: Rename
export type MouseButtonEventValue = {
  button: MouseButtonType;
  x: number;
  y: number;
  type: MouseButtonEventType;
};

export const MouseButtonEvent = defineComponent();
export const MouseButtonEventListener = defineComponent();
export const MouseButtonHold = defineComponent();

export class MouseButtonEventProxy {
  private static instance: MouseButtonEventProxy = new MouseButtonEventProxy();
  private eid: number;
  private map: Map<number, MouseButtonEventValue[]>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): MouseButtonEventProxy {
    MouseButtonEventProxy.instance.eid = eid;
    return MouseButtonEventProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, []);
  }

  add(
    type: MouseButtonEventType,
    button: MouseButtonType,
    x: number,
    y: number
  ): void {
    this.map.get(this.eid)!.push({button, x, y, type});
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get events(): MouseButtonEventValue[] {
    return this.map.get(this.eid)!;
  }
}

export const MouseMoveEvent = defineComponent();
export const MouseMoveEventListener = defineComponent();

export type MouseMoveEventValue = {
  x: number;
  y: number;
};

export class MouseMoveEventProxy {
  private static instance: MouseMoveEventProxy = new MouseMoveEventProxy();
  private eid: number;
  private map: Map<number, MouseMoveEventValue[]>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): MouseMoveEventProxy {
    MouseMoveEventProxy.instance.eid = eid;
    return MouseMoveEventProxy.instance;
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

  get events(): MouseMoveEventValue[] {
    return this.map.get(this.eid)!;
  }
}

export const MousePosition = defineComponent();

export class MousePositionProxy {
  private static instance: MousePositionProxy = new MousePositionProxy();
  private eid: number;
  private map: Map<number, { x: number, y: number }>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): MousePositionProxy {
    MousePositionProxy.instance.eid = eid;
    return MousePositionProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, {x: 0, y: 0});
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

export const CurrentMousePosition = defineComponent();
export const PreviousMousePosition = defineComponent();

export const MouseButtonEventHandler = defineComponent();
export const MouseButtonEventHandlerReady = defineComponent();

export class MouseButtonEventHandlerProxy {
  private static instance: MouseButtonEventHandlerProxy = new MouseButtonEventHandlerProxy();
  private eid: number;
  private targets: Map<number, HTMLElement>;
  private listeners: Map<number, {
    mousedownListener: (event: MouseEvent) => void;
    mouseupListener: (event: MouseEvent) => void;
    contextmenuListener: (event: MouseEvent) => void;
  }>;

  private constructor() {
    this.eid = NULL_EID;
    this.targets = new Map();
    this.listeners = new Map();
  }

  static get(eid: number): MouseButtonEventHandlerProxy {
    MouseButtonEventHandlerProxy.instance.eid = eid;
    return MouseButtonEventHandlerProxy.instance;
  }

  init(target: HTMLElement): void {
    this.targets.set(this.eid, target);
  }

  allocate(
    mousedownListener: (event: MouseEvent) => void,
    mouseupListener: (event: MouseEvent) => void,
    contextmenuListener: (event: MouseEvent) => void
  ): void {
    this.listeners.set(this.eid, {
      mousedownListener,
      mouseupListener,
      contextmenuListener
    });
  }

  free(): void {
    this.targets.delete(this.eid);
    this.listeners.delete(this.eid);
  }

  get target(): HTMLElement {
    return this.targets.get(this.eid)!;
  }

  get mousedownListener(): (event: MouseEvent) => void {
    return this.listeners.get(this.eid)!.mousedownListener;
  }

  get mouseupListener(): (event: MouseEvent) => void {
    return this.listeners.get(this.eid)!.mouseupListener;
  }

  get contextmenuListener(): (event: MouseEvent) => void {
    return this.listeners.get(this.eid)!.contextmenuListener;
  }

  get alive(): boolean {
    return this.targets.has(this.eid) || this.listeners.has(this.eid);
  }

  get listenersAlive(): boolean {
    return this.listeners.has(this.eid);
  }
}

export const MouseMoveEventHandler = defineComponent();
export const MouseMoveEventHandlerReady = defineComponent();

export class MouseMoveEventHandlerProxy {
  private static instance: MouseMoveEventHandlerProxy = new MouseMoveEventHandlerProxy();
  private eid: number;
  private targets: Map<number, HTMLElement>;
  private listeners: Map<number, (event: MouseEvent) => void>;

  private constructor() {
    this.eid = NULL_EID;
    this.targets = new Map();
    this.listeners = new Map();
  }

  static get(eid: number): MouseMoveEventHandlerProxy {
    MouseMoveEventHandlerProxy.instance.eid = eid;
    return MouseMoveEventHandlerProxy.instance;
  }

  init(target: HTMLElement): void {
    this.targets.set(this.eid, target);
  }

  allocate(listener: (event: MouseEvent) => void): void {
    this.listeners.set(this.eid, listener);
  }

  free(): void {
    this.targets.delete(this.eid);
    this.listeners.delete(this.eid);
  }

  get listener(): (event: MouseEvent) => void {
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
