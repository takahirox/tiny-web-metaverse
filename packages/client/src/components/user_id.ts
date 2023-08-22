import { defineComponent } from "bitecs";
import { NULL_EID } from "../common";

export const UserId = defineComponent();

export class UserIdProxy {
  private static instance: UserIdProxy = new UserIdProxy();	
  private eid: number;
  private map: Map<number, string>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): UserIdProxy {
    UserIdProxy.instance.eid = eid;
    return UserIdProxy.instance;
  }

  allocate(userId: string): void {
    this.map.set(this.eid, userId);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get userId(): string {
    return this.map.get(this.eid)!;
  }
}
