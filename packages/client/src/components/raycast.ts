import { defineComponent, Types } from "bitecs";
import { Raycaster } from "three";
import { NULL_EID } from "../common";

export const Raycastable = defineComponent();
export const Raycasted = defineComponent({
  distance: Types.f32
});
export const RaycastedByFirstRay = defineComponent();
export const RaycastedBySecondRay = defineComponent();

export const RaycastedNearest = defineComponent();
export const RaycastedNearestByFirstRay = defineComponent();
export const RaycastedNearestBySecondRay = defineComponent();

export const RaycasterComponent = defineComponent();

export class RaycasterProxy {
  private static instance: RaycasterProxy = new RaycasterProxy();
  private eid: number;
  private map: Map<number, Raycaster>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): RaycasterProxy {
    RaycasterProxy.instance.eid = eid;
    return RaycasterProxy.instance;
  }

  allocate(raycaster: Raycaster): void {
    this.map.set(this.eid, raycaster);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get raycaster(): Raycaster {
    return this.map.get(this.eid)!;
  }
}
