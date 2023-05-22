import { defineQuery, IWorld } from "bitecs";
import { NetworkEventSender } from "../components/network";

const eventQuery = defineQuery([NetworkEventSender]);

export const networkSendSystem = (world: IWorld) => {
  eventQuery(world).forEach(_eid => {

  });
};