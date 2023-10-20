import { defineComponent } from "bitecs";
import { NULL_EID } from "../common";

export const Peers = defineComponent();

export class PeersProxy {
  private static instance: PeersProxy = new PeersProxy();
  private eid: number;
  private map: Map<number, Map<string /* userId */, string /* username */>>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): PeersProxy {
    PeersProxy.instance.eid = eid;
    return PeersProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, new Map());
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get peers(): Map<string, string> {
    return this.map.get(this.eid)!;
  }
}

export const PeersManager = defineComponent();

export const UsernameChangeRequestor = defineComponent();

export class UsernameChangeRequestorProxy {
  private static instance: UsernameChangeRequestorProxy = new UsernameChangeRequestorProxy();
  private eid: number;
  private map: Map<number, string>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): UsernameChangeRequestorProxy {
    UsernameChangeRequestorProxy.instance.eid = eid;
    return UsernameChangeRequestorProxy.instance;
  }

  allocate(username: string): void {
    this.map.set(this.eid, username);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get username(): string {
    return this.map.get(this.eid)!;
  }
}
