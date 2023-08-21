import {
  addComponent,
  defineComponent,
  IWorld,
  removeComponent
} from "bitecs";
import { NULL_EID } from "../common";

export const RoomId = defineComponent();

export class RoomIdProxy {
  private static instance: RoomIdProxy = new RoomIdProxy();	
  private eid: number;
  private map: Map<number, string>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): RoomIdProxy {
    RoomIdProxy.instance.eid = eid;
    return RoomIdProxy.instance;
  }

  allocate(world: IWorld, roomId: string): void {
    addComponent(world, RoomId, this.eid);
    this.map.set(this.eid, roomId);
  }

  free(world: IWorld): void {
    this.map.delete(this.eid);
    removeComponent(world, RoomId, this.eid);
  }

  get roomId(): string {
    return this.map.get(this.eid)!;
  }
}