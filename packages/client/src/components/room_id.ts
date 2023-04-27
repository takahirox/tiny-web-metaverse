import { defineComponent } from "bitecs";
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

  allocate(roomId: string): void {
    this.map.set(this.eid, roomId);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get roomId(): string {
    return this.map.get(this.eid)!;
  }
}