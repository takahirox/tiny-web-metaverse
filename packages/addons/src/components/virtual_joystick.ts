import { defineComponent } from "bitecs";
import { NULL_EID } from "@tiny-web-metaverse/client/src";

export const VirtualJoystick = defineComponent();
export const VirtualJoystickLeft = defineComponent();
export const VirtualJoystickRight = defineComponent();

export class VirtualJoystickProxy {
  private static instance: VirtualJoystickProxy = new VirtualJoystickProxy();
  private eid: number;
  private map: Map<number, {
    active: boolean,  
    distance: number,
    x: number,
    y: number
  }>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): VirtualJoystickProxy {
    VirtualJoystickProxy.instance.eid = eid;
    return VirtualJoystickProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, { active: false, distance: 0.0, x: 0.0, y: 0.0 });
  }

  activate(active: boolean): void {
    this.map.get(this.eid)!.active = active;
  }

  update(x: number, y: number, distance: number): void {
    const data = this.map.get(this.eid)!;
    data.x = x;
    data.y = y;
    data.distance = distance;
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get active(): boolean {
    return this.map.get(this.eid)!.active;
  }

  get distance(): number {
    return this.map.get(this.eid)!.distance;
  }

  get x(): number {
    return this.map.get(this.eid)!.x;
  }

  get y(): number {
    return this.map.get(this.eid)!.y;
  }
}

export enum VirtualJoystickType {
  Left,
  Right
};

export enum VirtualJoystickEventType {
  End,
  Move,
  Start
};

export const VirtualJoystickEvent = defineComponent();

export type VirtualJoystickMoveEventValue = {
  distance: number;
  x: number;
  y: number;
};

export type VirtualJoystickEventValue = {
  // TODO: Specify data is non-null only if event type is move, if possible
  //       Separate VirtualJoystickEvent and VirtualJoystickMoveEvent?
  data?: VirtualJoystickMoveEventValue;
  stick: VirtualJoystickType;
  type: VirtualJoystickEventType;
};

export class VirtualJoystickEventProxy {
  private static instance: VirtualJoystickEventProxy = new VirtualJoystickEventProxy();
  private eid: number;
  private map: Map<number, VirtualJoystickEventValue[]>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): VirtualJoystickEventProxy {
    VirtualJoystickEventProxy.instance.eid = eid;
    return VirtualJoystickEventProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, []);
  }

  add(
    stick: VirtualJoystickType,
    type: VirtualJoystickEventType,
    data?: VirtualJoystickMoveEventValue
  ): void {
    this.map.get(this.eid)!.push({ data, stick, type });
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get events(): VirtualJoystickEventValue[] {
    return this.map.get(this.eid)!;
  }
}

export const VirtualJoystickEventListener = defineComponent();
