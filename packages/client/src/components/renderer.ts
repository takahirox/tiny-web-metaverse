import { defineComponent } from "bitecs";
import { WebGLRenderer } from "three";
import { NULL_EID } from "../common";

export const Renderer = defineComponent();

export class RendererProxy {
  private static instance: RendererProxy = new RendererProxy();
  private eid: number;
  private map: Map<number, WebGLRenderer>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): RendererProxy {
    RendererProxy.instance.eid = eid;
    return RendererProxy.instance;
  }

  allocate(renderer: WebGLRenderer) {
    this.map.set(this.eid, renderer);
  }

  free() {
    this.map.delete(this.eid);
  }	

  get renderer(): WebGLRenderer {
    return this.map.get(this.eid)!;
  }
}
