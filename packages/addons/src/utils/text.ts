import {
  addComponent,
  IWorld
} from "bitecs";
import { Text as TroikaText } from "troika-three-text";
import {
  TextComponent,
  TextProxy
} from "../components/text";
import {
  addObject3D
} from "@tiny-web-metaverse/client/src";

// TODO: Add text optional parameters

export const addTextComponent = (world: IWorld, eid: number, str: string): void => {
  addComponent(world, TextComponent, eid);

  const text = new TroikaText();
  text.text = str;
  text.anchorX = 'center';
  text.strokeWidth = 0.001;
  text.textAlign = 'center';
  TextProxy.get(eid).allocate(text);

  addObject3D(world, text, eid);
};
