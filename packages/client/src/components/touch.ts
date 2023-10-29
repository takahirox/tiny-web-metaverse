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
