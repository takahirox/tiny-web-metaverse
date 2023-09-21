import { defineComponent } from "bitecs";
import { NULL_EID } from "@tiny-web-metaverse/client/src";

export const ImageComponent = defineComponent();

export class ImageProxy {
  private static instance: ImageProxy = new ImageProxy();
  private eid: number;
  private map: Map<number, ImageBitmap>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): ImageProxy {
    ImageProxy.instance.eid = eid;
    return ImageProxy.instance;
  }

  allocate(bitmap: ImageBitmap): void {
    this.map.set(this.eid, bitmap);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get image(): ImageBitmap {
    return this.map.get(this.eid)!;
  }
}

export const ImageLoader = defineComponent();

export class ImageLoaderProxy {
  private static instance: ImageLoaderProxy = new ImageLoaderProxy();
  private eid: number;
  private map: Map<number, string /* url */>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): ImageLoaderProxy {
    ImageLoaderProxy.instance.eid = eid;
    return ImageLoaderProxy.instance;
  }

  allocate(url: string): void {
    this.map.set(this.eid, url);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get url(): string {
    return this.map.get(this.eid)!;
  }
}
