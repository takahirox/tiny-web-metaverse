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

export const RendererTag = defineComponent();
const RendererMap = new Map<number, WebGLRenderer>();

class RendererInitializeProxy {
  eid: number;

  constructor(eid: number) {
    this.eid = eid;
  }

  add(world: IWorld, params: RendererParams = {}): void {
    addComponent(world, RendererInitialize, this.eid);
    RendererInitializeMap.set(this.eid, {
      height: params.height || window.innerHeight,
      parentDomElement: params.parentDomElement || document.body,
      pixelRatio: params.pixelRatio || window.devicePixelRatio,
      width: params.width || window.innerWidth
    });
  }

  remove(world: IWorld): void {
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

class RendererProxy {
  eid: number;

  constructor(eid: number) {
    this.eid = eid;
  }

  add(world: IWorld, renderer: WebGLRenderer): void {
    addComponent(world, RendererTag, this.eid);
    RendererMap.set(this.eid, renderer);
  }

  remove(world: IWorld): void {
    removeComponent(world, RendererTag, this.eid);
    RendererMap.delete(this.eid);
  }

  get renderer(): WebGLRenderer {
    return RendererMap.get(this.eid)!;
  }
}

export const rendererInitializeProxy = new RendererInitializeProxy(NULL_EID);
export const rendererProxy = new RendererProxy(NULL_EID);
