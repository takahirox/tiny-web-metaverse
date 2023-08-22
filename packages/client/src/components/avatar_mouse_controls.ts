import {
  addComponent,
  defineComponent,
  IWorld,
  removeComponent
} from "bitecs";
import { NULL_EID } from "../common";

export const AvatarMouseControls = defineComponent();

export class AvatarMouseControlsProxy {
  private static instance: AvatarMouseControlsProxy = new AvatarMouseControlsProxy();
  private eid: number;
  private map: Map<number, boolean>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): AvatarMouseControlsProxy {
    AvatarMouseControlsProxy.instance.eid = eid;
    return AvatarMouseControlsProxy.instance;
  }

  allocate(world: IWorld): void {
    addComponent(world, AvatarMouseControls, this.eid);
    this.map.set(this.eid, false);
  }

  free(world: IWorld): void {
    this.map.delete(this.eid);
    removeComponent(world, AvatarMouseControls, this.eid);
  }

  get enabled(): boolean {
    return this.map.get(this.eid)!;
  }

  set enabled(value: boolean) {
    this.map.set(this.eid, value);
  }
}
