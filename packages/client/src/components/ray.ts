import { defineComponent } from "bitecs";
import { Ray } from "three";
import { NULL_EID } from "../common";

export const RayComponent = defineComponent();

export class RayProxy {
  private static instance: RayProxy = new RayProxy();
  private eid: number;
  private map: Map<number, Ray>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): RayProxy {
    RayProxy.instance.eid = eid;
    return RayProxy.instance;
  }

  allocate(ray: Ray): void {
    this.map.set(this.eid, ray);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get ray(): Ray {
    return this.map.get(this.eid)!;
  }
}

export const ActiveRay = defineComponent();

export const FirstRay = defineComponent();
export const SecondRay = defineComponent();

