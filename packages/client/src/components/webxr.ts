import { defineComponent } from "bitecs";
import { Group } from "three";
import { NULL_EID } from "../common";

export const XRSessionComponent = defineComponent();

export class XRSessionProxy {
  private static instance: XRSessionProxy = new XRSessionProxy();	
  private eid: number;
  private map: Map<number, {
    mode: XRSessionMode | null,
    session: XRSession | null
  }>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): XRSessionProxy {
    XRSessionProxy.instance.eid = eid;
    return XRSessionProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, { mode: null, session: null });
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get mode(): XRSessionMode | null {
    return this.map.get(this.eid)!.mode;
  }

  set mode(mode: XRSessionMode) {
    this.map.get(this.eid)!.mode = mode;
  }

  get session(): XRSession | null {
    return this.map.get(this.eid)!.session;
  }

  set session(session: XRSession | null) {
    this.map.get(this.eid).session = session;
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

export const InvisibleInAR = defineComponent();

export const XRController = defineComponent();

export class XRControllerProxy {
  private static instance: XRControllerProxy = new XRControllerProxy();	
  private eid: number;
  // Note: No XRController specific type/object in Three.js
  private map: Map<number, Group>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): XRControllerProxy {
    XRControllerProxy.instance.eid = eid;
    return XRControllerProxy.instance;
  }

  allocate(controller: Group): void {
    this.map.set(this.eid, controller);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get controller(): Group {
    return this.map.get(this.eid)!;
  }
}

export const FirstXRController = defineComponent();
export const SecondXRController = defineComponent();
export const ActiveXRController = defineComponent();

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

export enum XRControllerType {
  First = 0,
  Second
};

export enum XRControllerConnectionEventType {
  Connected = 'connected',
  Disconnected = 'disconnected'
};

// TODO: Rename
export type XRControllerConnectionEventValue = {
  controller: XRControllerType,
  type: XRControllerConnectionEventType;
};

export const XRControllerConnectionEvent = defineComponent();

export class XRControllerConnectionEventProxy {
  private static instance: XRControllerConnectionEventProxy = new XRControllerConnectionEventProxy();
  private eid: number;
  private map: Map<number, XRControllerConnectionEventValue[]>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): XRControllerConnectionEventProxy {
    XRControllerConnectionEventProxy.instance.eid = eid;
    return XRControllerConnectionEventProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, []);  
  }

  add(controller: XRControllerType, type: XRControllerConnectionEventType): void {
    this.map.get(this.eid)!.push({ controller, type });
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get events(): XRControllerConnectionEventValue[] {
    return this.map.get(this.eid)!;
  }
}

export const XRControllerConnectionEventListener = defineComponent();

export enum XRControllerSelectEventType {
  End = 'selectend',
  Start = 'selectstart'
};

// TODO: Rename
export type XRControllerSelectEventValue = {
  controller: XRControllerType,
  type: XRControllerSelectEventType;
};

export const XRControllerSelectEvent = defineComponent();

export class XRControllerSelectEventProxy {
  private static instance: XRControllerSelectEventProxy = new XRControllerSelectEventProxy();
  private eid: number;
  private map: Map<number, XRControllerSelectEventValue[]>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): XRControllerSelectEventProxy {
    XRControllerSelectEventProxy.instance.eid = eid;
    return XRControllerSelectEventProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, []);  
  }

  add(controller: XRControllerType, type: XRControllerSelectEventType): void {
    this.map.get(this.eid)!.push({ controller, type });
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get events(): XRControllerSelectEventValue[] {
    return this.map.get(this.eid)!;
  }
}

export const XRControllerSelectEventListener = defineComponent();
