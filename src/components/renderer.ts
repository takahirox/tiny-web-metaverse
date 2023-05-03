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
  parentDomElement?: HTMLElement;
  pixelRatio?: number;
  width?: number;
};

export const RendererInitialize = defineComponent();
const RendererInitializeMap = new Map<number, Required<RendererParams>>();

export const Renderer = defineComponent();
const RendererMap = new Map<number, WebGLRenderer>();

export class RendererInitializeProxy {
  private static instance: RendererInitializeProxy = new RendererInitializeProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): RendererInitializeProxy {
    RendererInitializeProxy.instance.eid = eid;
    return RendererInitializeProxy.instance;
  }

  allocate(world: IWorld, params: RendererParams = {}): void {
    addComponent(world, RendererInitialize, this.eid);
    RendererInitializeMap.set(this.eid, {
      height: params.height || window.innerHeight,
      parentDomElement: params.parentDomElement || document.body,
      pixelRatio: params.pixelRatio || window.devicePixelRatio,
      width: params.width || window.innerWidth
    });
  }

  free(world: IWorld): void {
    removeComponent(world, RendererInitialize, this.eid);
    RendererInitializeMap.delete(this.eid);
  }

  get height(): number {
    return RendererInitializeMap.get(this.eid)!.height;
  }

  get parentDomElement(): HTMLElement {
    return RendererInitializeMap.get(this.eid)!.parentDomElement;
  }

  get pixelRatio(): number {
    return RendererInitializeMap.get(this.eid)!.pixelRatio;
  }

  get width(): number {
    return RendererInitializeMap.get(this.eid)!.width;
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
