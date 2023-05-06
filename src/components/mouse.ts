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
export const MouseButtonEventHandler = defineComponent();
const MouseButtonEventHandlerMap = new Map<number, MouseButtonEventHandlerValue>();

// TODO: Rename
export type MouseButtonEventValue = {
  button: MouseButtonType;
  clientX: number;
  clientY: number;
  type: MouseButtonEventType;
};

export const MouseButtonEvent = defineComponent();
const MouseButtonEventMap = new Map<number, MouseButtonEventValue[]>();

export const MouseButtonEventListener = defineComponent();
export const MouseButtonHold = defineComponent();

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
    clientX: number,
    clientY: number
  ): void {
    if (!hasComponent(world, MouseButtonEvent, this.eid)) {
      addComponent(world, MouseButtonEvent, this.eid);
      MouseButtonEventMap.set(this.eid, []);
    }
    MouseButtonEventMap.get(this.eid)!.push({button, clientX, clientY, type});
  }

  free(world: IWorld): void {
    removeComponent(world, MouseButtonEvent, this.eid);
    MouseButtonEventMap.delete(this.eid);
  }

  get events(): MouseButtonEventValue[] {
    return MouseButtonEventMap.get(this.eid)!;
  }
}
