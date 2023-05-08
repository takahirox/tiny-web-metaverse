import {
  addComponent,
  defineComponent,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
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

type MouseButtonEventHandlerValue = {
  mousedownListener: (event: MouseEvent) => void;
  mouseupListener: (event: MouseEvent) => void;
};

export const MouseButtonEventHandlerInit = defineComponent();
export const MouseButtonEventHandlerDestroy = defineComponent();
export const MouseButtonEventHandler = defineComponent();
const MouseButtonEventHandlerMap = new Map<number, MouseButtonEventHandlerValue>();

// TODO: Rename
export type MouseButtonEventValue = {
  button: MouseButtonType;
  x: number;
  y: number;
  type: MouseButtonEventType;
};

export const MouseButtonEvent = defineComponent();
const MouseButtonEventMap = new Map<number, MouseButtonEventValue[]>();

export const MouseButtonEventListener = defineComponent();
export const MouseButtonHold = defineComponent();

type MouseMoveEventHandlerValue = (event: MouseEvent) => void;

export const MouseMoveEventHandlerInit = defineComponent();
export const MouseMoveEventHandlerDestroy = defineComponent();
export const MouseMoveEventHandler = defineComponent();
const MouseMoveEventHandlerMap = new Map<number, MouseMoveEventHandlerValue>();

export type MouseMoveEventValue = {
  x: number;
  y: number;
};

export const MouseMoveEvent = defineComponent();
const MouseMoveEventMap = new Map<number, MouseMoveEventValue[]>();

export const MouseMoveEventListener = defineComponent();

export type MousePositionValue = {
  x: number;
  y: number;
};

export const MousePosition = defineComponent();
const MousePositionMap = new Map<number, MousePositionValue>();

export class MouseButtonEventHandlerProxy {
  private static instance: MouseButtonEventHandlerProxy = new MouseButtonEventHandlerProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): MouseButtonEventHandlerProxy {
    MouseButtonEventHandlerProxy.instance.eid = eid;
    return MouseButtonEventHandlerProxy.instance;
  }

  allocate(
    world: IWorld,
    mousedownListener: (event: MouseEvent) => void,
    mouseupListener: (event: MouseEvent) => void
  ): void {
    addComponent(world, MouseButtonEventHandler, this.eid);
    MouseButtonEventHandlerMap.set(this.eid, {
      mousedownListener,
      mouseupListener
    });
  }

  free(world: IWorld): void {
    removeComponent(world, MouseButtonEventHandler, this.eid);
    MouseButtonEventHandlerMap.delete(this.eid);
  }

  get mousedownListener(): (event: MouseEvent) => void {
    return MouseButtonEventHandlerMap.get(this.eid).mousedownListener;
  }

  get mouseupListener(): (event: MouseEvent) => void {
    return MouseButtonEventHandlerMap.get(this.eid).mouseupListener;
  }
}

export class MouseButtonEventProxy {
  private static instance: MouseButtonEventProxy = new MouseButtonEventProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): MouseButtonEventProxy {
    MouseButtonEventProxy.instance.eid = eid;
    return MouseButtonEventProxy.instance;
  }

  add(
    world: IWorld,
    type: MouseButtonEventType,
    button: MouseButtonType,
    x: number,
    y: number
  ): void {
    if (!hasComponent(world, MouseButtonEvent, this.eid)) {
      addComponent(world, MouseButtonEvent, this.eid);
      MouseButtonEventMap.set(this.eid, []);
    }
    MouseButtonEventMap.get(this.eid)!.push({button, x, y, type});
  }

  free(world: IWorld): void {
    removeComponent(world, MouseButtonEvent, this.eid);
    MouseButtonEventMap.delete(this.eid);
  }

  get events(): MouseButtonEventValue[] {
    return MouseButtonEventMap.get(this.eid)!;
  }
}

export class MouseMoveEventHandlerProxy {
  private static instance: MouseMoveEventHandlerProxy = new MouseMoveEventHandlerProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): MouseMoveEventHandlerProxy {
    MouseMoveEventHandlerProxy.instance.eid = eid;
    return MouseMoveEventHandlerProxy.instance;
  }

  allocate(
    world: IWorld,
    listener: (event: MouseEvent) => void
  ): void {
    addComponent(world, MouseMoveEventHandler, this.eid);
    MouseMoveEventHandlerMap.set(this.eid, listener);
  }

  free(world: IWorld): void {
    removeComponent(world, MouseMoveEventHandler, this.eid);
    MouseMoveEventHandlerMap.delete(this.eid);
  }

  get listener(): (event: MouseEvent) => void {
    return MouseMoveEventHandlerMap.get(this.eid)!;
  }
}

export class MouseMoveEventProxy {
  private static instance: MouseMoveEventProxy = new MouseMoveEventProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): MouseMoveEventProxy {
    MouseMoveEventProxy.instance.eid = eid;
    return MouseMoveEventProxy.instance;
  }

  add(world: IWorld, x: number, y: number): void {
    if (!hasComponent(world, MouseMoveEvent, this.eid)) {
      addComponent(world, MouseMoveEvent, this.eid);
      MouseMoveEventMap.set(this.eid, []);
    }
    MouseMoveEventMap.get(this.eid)!.push({x, y});
  }

  free(world: IWorld): void {
    removeComponent(world, MouseMoveEvent, this.eid);
    MouseMoveEventMap.delete(this.eid);
  }

  get events(): MouseMoveEventValue[] {
    return MouseMoveEventMap.get(this.eid)!;
  }
}


export class MousePositionProxy {
  private static instance: MousePositionProxy = new MousePositionProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): MousePositionProxy {
    MousePositionProxy.instance.eid = eid;
    return MousePositionProxy.instance;
  }

  allocate(world: IWorld): void {
    addComponent(world, MousePosition, this.eid);
    MousePositionMap.set(this.eid, {x: 0, y: 0});
  }

  free(world: IWorld): void {
    removeComponent(world, MousePosition, this.eid);
    MousePositionMap.delete(this.eid);
  }

  update(x: number, y: number): void {
    const values = MousePositionMap.get(this.eid)!;
    values.x = x;
    values.y = y;
  }

  get x(): number {
    return MousePositionMap.get(this.eid)!.x;
  }

  get y(): number {
    return MousePositionMap.get(this.eid)!.y;
  }
}
