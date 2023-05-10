import {
  addComponent,
  defineComponent,
  IWorld,
  removeComponent,
  Types
} from "bitecs";
import { Raycaster } from "three";
import { NULL_EID } from "../common";

export const RaycasterTag = defineComponent();
const RaycasterMap = new Map<number, Raycaster>();

export const Raycastable = defineComponent();
export const Raycasted = defineComponent({
  distance: Types.f32
});

export class RaycasterProxy {
  private static instance: RaycasterProxy = new RaycasterProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): RaycasterProxy {
    RaycasterProxy.instance.eid = eid;
    return RaycasterProxy.instance;
  }

  allocate(world: IWorld, raycaster: Raycaster): void {
    addComponent(world, RaycasterTag, this.eid);
    RaycasterMap.set(this.eid, raycaster);
  }

  free(world: IWorld): void {
    removeComponent(world, RaycasterTag, this.eid);
    RaycasterMap.delete(this.eid);
  }

  get raycaster(): Raycaster {
    return RaycasterMap.get(this.eid)!;
  }
}
