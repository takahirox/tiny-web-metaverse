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
