import {
  addComponent,
  defineComponent,
  IWorld,
  removeComponent
} from "bitecs";
import { NULL_EID } from "../common";

type WindowResizeEventHandlerValue = () => void;

export const WindowResizeEventHandlerInit = defineComponent();
export const WindowResizeEventHandlerDestroy = defineComponent();
export const WindowResizeEventHandler = defineComponent();
const WindowResizeEventHandlerMap = new Map<number, WindowResizeEventHandlerValue>();

export const WindowResizeEvent = defineComponent();
export const WindowResizeEventListener = defineComponent();
// TODO: Rename?
export const WindowSize = defineComponent();

export class WindowResizeEventHandlerProxy {
  private static instance: WindowResizeEventHandlerProxy = new WindowResizeEventHandlerProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): WindowResizeEventHandlerProxy {
    WindowResizeEventHandlerProxy.instance.eid = eid;
    return WindowResizeEventHandlerProxy.instance;
  }

  allocate(world: IWorld, listener: () => void): void {
    addComponent(world, WindowResizeEventHandler, this.eid);
    WindowResizeEventHandlerMap.set(this.eid, listener);
  }

  free(world: IWorld): void {
    removeComponent(world, WindowResizeEventHandler, this.eid);
    WindowResizeEventHandlerMap.delete(this.eid);
  }

  get listener(): () => void {
    return WindowResizeEventHandlerMap.get(this.eid);
  }
}
