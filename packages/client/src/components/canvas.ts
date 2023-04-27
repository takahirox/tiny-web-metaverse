import { defineComponent } from "bitecs";
import { NULL_EID } from "../common";

export const Canvas = defineComponent();

export class CanvasProxy {
  private static instance: CanvasProxy = new CanvasProxy();
  private eid: number;
  // TODO: OffscreenCanvas support?
  private map: Map<number, HTMLCanvasElement>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): CanvasProxy {
    CanvasProxy.instance.eid = eid;
    return CanvasProxy.instance;
  }

  allocate(canvas: HTMLCanvasElement): void {
    this.map.set(this.eid, canvas);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get canvas(): HTMLCanvasElement {
    return this.map.get(this.eid)!;
  }
}
