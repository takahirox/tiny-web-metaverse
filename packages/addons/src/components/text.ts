import { defineComponent } from "bitecs";
import { Text as TroikaText } from "troika-three-text";
import { NULL_EID } from "@tiny-web-metaverse/client/src";

export const TextComponent = defineComponent();

export class TextProxy {
  private static instance: TextProxy = new TextProxy();
  private eid: number;
  private map: Map<number, TroikaText>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): TextProxy {
    TextProxy.instance.eid = eid;
    return TextProxy.instance;
  }

  allocate(text: TroikaText): void {
    this.map.set(this.eid, text);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get text(): TroikaText {
    return this.map.get(this.eid)!;
  }
}
