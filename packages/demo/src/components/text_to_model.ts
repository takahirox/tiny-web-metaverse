import { defineComponent } from "bitecs";
import { NULL_EID } from "@tiny-web-metaverse/client/src";

export const TextToModel = defineComponent();

export const TextToModelLoader = defineComponent();

export class TextToModelLoaderProxy {
  private static instance: TextToModelLoaderProxy = new TextToModelLoaderProxy();
  private eid: number;
  private map: Map<number, string>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): TextToModelLoaderProxy {
    TextToModelLoaderProxy.instance.eid = eid;
    return TextToModelLoaderProxy.instance;
  }

  allocate(query: string): void {
    this.map.set(this.eid, query);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get query(): string {
    return this.map.get(this.eid)!;
  }
}
