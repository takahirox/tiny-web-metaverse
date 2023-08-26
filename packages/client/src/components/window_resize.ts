import { defineComponent } from "bitecs";
import { NULL_EID } from "../common";

export const WindowResizeEvent = defineComponent();
export const WindowResizeEventListener = defineComponent();
// TODO: Rename?
export const WindowSize = defineComponent();

export const WindowResizeEventHandler = defineComponent();
export const WindowResizeEventHandlerReady = defineComponent();

export class WindowResizeEventHandlerProxy {
  private static instance: WindowResizeEventHandlerProxy = new WindowResizeEventHandlerProxy();
  private eid: number;
  private map: Map<number, () => void>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): WindowResizeEventHandlerProxy {
    WindowResizeEventHandlerProxy.instance.eid = eid;
    return WindowResizeEventHandlerProxy.instance;
  }

  allocate(listener: () => void): void {
    this.map.set(this.eid, listener);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get listener(): () => void {
    return this.map.get(this.eid)!;
  }

  get alive(): boolean {
    return this.map.has(this.eid);
  }
}
