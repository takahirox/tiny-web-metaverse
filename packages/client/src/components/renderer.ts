import {
  addComponent,
  defineComponent,
  IWorld,
  removeComponent
} from "bitecs";
import { WebGLRenderer } from "three";
import { NULL_EID } from "../common";

type RendererParams = {
  height?: number;
  canvas?: HTMLCanvasElement;
  pixelRatio?: number;
  width?: number;
};

export const RendererInit = defineComponent();
const RendererInitMap = new Map<number, Required<RendererParams>>();
export const RendererDestroy = defineComponent();

export const Renderer = defineComponent();
const RendererMap = new Map<number, WebGLRenderer>();

export class RendererInitProxy {
  private static instance: RendererInitProxy = new RendererInitProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): RendererInitProxy {
    RendererInitProxy.instance.eid = eid;
    return RendererInitProxy.instance;
  }

  allocate(world: IWorld, params: RendererParams = {}): void {
    addComponent(world, RendererInit, this.eid);
    RendererInitMap.set(this.eid, {
      height: params.height || window.innerHeight,
      canvas: params.canvas || document.createElement('canvas'),
      pixelRatio: params.pixelRatio || window.devicePixelRatio,
      width: params.width || window.innerWidth
    });
  }

  free(world: IWorld): void {
    removeComponent(world, RendererInit, this.eid);
    RendererInitMap.delete(this.eid);
  }

  get height(): number {
    return RendererInitMap.get(this.eid)!.height;
  }

  get canvas(): HTMLCanvasElement {
    return RendererInitMap.get(this.eid)!.canvas;
  }

  get pixelRatio(): number {
    return RendererInitMap.get(this.eid)!.pixelRatio;
  }

  get width(): number {
    return RendererInitMap.get(this.eid)!.width;
  }
}

export class RendererProxy {
  private static instance: RendererProxy = new RendererProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): RendererProxy {
    RendererProxy.instance.eid = eid;
    return RendererProxy.instance;
  }

  allocate(world: IWorld, renderer: WebGLRenderer): void {
    addComponent(world, Renderer, this.eid);
    RendererMap.set(this.eid, renderer);
  }

  free(world: IWorld): void {
    removeComponent(world, Renderer, this.eid);
    RendererMap.delete(this.eid);
  }

  get renderer(): WebGLRenderer {
    return RendererMap.get(this.eid)!;
  }
}
