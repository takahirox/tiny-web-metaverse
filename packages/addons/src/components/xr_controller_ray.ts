import { defineComponent } from "bitecs";
import { Line } from "three";
import { NULL_EID } from "@tiny-web-metaverse/client/src";

export const XRControllerRay = defineComponent();

export class XRControllerRayProxy {
  private static instance: XRControllerRayProxy = new XRControllerRayProxy();
  private eid: number;
  private map: Map<number, Line>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): XRControllerRayProxy {
    XRControllerRayProxy.instance.eid = eid;
    return XRControllerRayProxy.instance;
  }

  allocate(line: Line): void {
    this.map.set(this.eid, line);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get line(): Line {
    return this.map.get(this.eid)!;
  }
}

export const FirstXRControllerRay = defineComponent();
export const SecondXRControllerRay = defineComponent();
