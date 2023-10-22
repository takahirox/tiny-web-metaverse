import { defineComponent } from "bitecs";
import { NULL_EID } from "../common";

export const XRSessionComponent = defineComponent();

export class XRSessionProxy {
  private static instance: XRSessionProxy = new XRSessionProxy();	
  private eid: number;
  private map: Map<number, XRSession | null>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): XRSessionProxy {
    XRSessionProxy.instance.eid = eid;
    return XRSessionProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, null);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get session(): XRSession | null {
    return this.map.get(this.eid)!;
  }

  set session(session: XRSession | null) {
    this.map.set(this.eid, session);
  }
}

export const XRFrameComponent = defineComponent();

export class XRFrameProxy {
  private static instance: XRFrameProxy = new XRFrameProxy();	
  private eid: number;
  private map: Map<number, XRFrame | null>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): XRFrameProxy {
    XRFrameProxy.instance.eid = eid;
    return XRFrameProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, null);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get frame(): XRFrame | null {
    return this.map.get(this.eid)!;
  }

  set frame(frame: XRFrame | null) {
    this.map.set(this.eid, frame);
  }
}

export enum WebXRSessionEventType {
  End,
  Start
};

// TODO: Rename
export type WebXRSessionEventValue = {
  mode: XRSessionMode,
  session: XRSession,
  type: WebXRSessionEventType;
};

export const WebXRSessionEvent = defineComponent();

export class WebXRSessionEventProxy {
  private static instance: WebXRSessionEventProxy = new WebXRSessionEventProxy();
  private eid: number;
  private map: Map<number, WebXRSessionEventValue[]>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): WebXRSessionEventProxy {
    WebXRSessionEventProxy.instance.eid = eid;
    return WebXRSessionEventProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, []);  
  }

  add(type: WebXRSessionEventType, mode: XRSessionMode, session: XRSession): void {
    this.map.get(this.eid)!.push({ mode, session, type });
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get events(): WebXRSessionEventValue[] {
    return this.map.get(this.eid)!;
  }
}

export const WebXRSessionEventListener = defineComponent();
export const WebXRSessionManager = defineComponent();
