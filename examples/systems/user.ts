import { defineQuery, enterQuery, IWorld } from "bitecs";
import {
  NetworkEvent,
  NetworkEventProxy,
  NetworkMessageType,
  UserNetworkEventListener
} from "../../src/components/network";
import { UserEventHandler } from "../components/user_event_handler";

const eventEnterQuery = 
  enterQuery(defineQuery([NetworkEvent, UserEventHandler, UserNetworkEventListener]));

export const userEventSystem = (world: IWorld) => {
  eventEnterQuery(world).forEach(eid => {
    for (const e of NetworkEventProxy.get(eid).events) {
      switch (e.type) {
        // TODO: Implement properly
        case NetworkMessageType.UserJoined:
          console.log(e);
          break;
        case NetworkMessageType.UserLeft:
          console.log(e);
          break;
      }
    }
  });
};
