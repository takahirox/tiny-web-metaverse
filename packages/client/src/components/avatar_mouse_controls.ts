import {
  addComponent,
  defineComponent,
  IWorld,
  removeComponent
} from "bitecs";
import { NULL_EID } from "../common";

export const AvatarMouseControls = defineComponent();

const AvatarMouseControlsMap = new Map<number, boolean>();

export class AvatarMouseControlsProxy {
  private static instance: AvatarMouseControlsProxy = new AvatarMouseControlsProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): AvatarMouseControlsProxy {
    AvatarMouseControlsProxy.instance.eid = eid;
    return AvatarMouseControlsProxy.instance;
  }

  allocate(world: IWorld): void {
    addComponent(world, AvatarMouseControls, this.eid);
    AvatarMouseControlsMap.set(this.eid, false);
  }

  free(world: IWorld): void {
    removeComponent(world, AvatarMouseControls, this.eid);
    AvatarMouseControlsMap.delete(this.eid);
  }

  get enabled(): boolean {
    return AvatarMouseControlsMap.get(this.eid)!;
  }

  set enabled(value: boolean) {
    AvatarMouseControlsMap.set(this.eid, value);
  }
}
