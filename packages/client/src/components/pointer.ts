import { defineComponent } from "bitecs";
import { NULL_EID } from "../common";

export const Pointer = defineComponent();

export class PointerProxy {
  private static instance: PointerProxy = new PointerProxy();
  private eid: number;
  private map: Map<number, { x: number, y: number }>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): PointerProxy {
    PointerProxy.instance.eid = eid;
    return PointerProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, { x: 0.0, y: 0.0 });
  }

  update(x: number, y: number): void {
    const data = this.map.get(this.eid)!;
    data.x = x;
    data.y = y;
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get x(): number {
    return this.map.get(this.eid)!.x;
  }

  get y(): number {
    return this.map.get(this.eid)!.y;
  }
}
