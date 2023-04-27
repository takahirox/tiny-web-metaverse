import {
  addComponent,
  IWorld
} from "bitecs";
import { getAvatarUsername } from "@tiny-web-metaverse/client/src";
import { Billboard } from "../components/billboard";
import { Nametag } from "../components/nametag";
import { addTextComponent } from "./text";

export const addNametagComponent = (world: IWorld, eid: number, objectEid: number): void => {
  addComponent(world, Nametag, eid);
  Nametag.objectEid[eid] = objectEid;
  addComponent(world, Billboard, eid);

  const name = getAvatarUsername(world, objectEid);
  addTextComponent(world, eid, name !== null ? name : '');
};
