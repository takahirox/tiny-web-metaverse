import {
  defineQuery,
  exitQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  PeersManager,
  UsernameChangeRequestor,
  UsernameChangeRequestorProxy
} from "../components/peer";
import {
  NetworkEvent,
  NetworkEventProxy,
  NetworkMessageType
} from "../components/network";
import { removeEntityIfNoComponent } from "../utils/bitecs";
import { getStateAdapter } from "../utils/network";
import { getPeersProxy } from "../utils/peer";

const managerQuery = defineQuery([PeersManager, NetworkEvent]);
const requestorQuery = defineQuery([UsernameChangeRequestor]);
const exitRequestorQuery = exitQuery(requestorQuery);

// TODO: Validation

export const peerSystem = (world: IWorld) => {
  managerQuery(world).forEach(eid => {
    const peers = getPeersProxy(world).peers;
    for (const e of NetworkEventProxy.get(eid).events) {
      if (e.type === NetworkMessageType.UsersList) {
        const usersList = e.data;
        for (const user of usersList) {
          peers.set(user.user_id, {joined: true, previousUsername: '', username: user.username});
        }
      } else if (e.type === NetworkMessageType.UserJoined) {
        peers.set(e.data.user_id, {joined: true, previousUsername: '', username: e.data.username});
      } else if (e.type === NetworkMessageType.UserLeft) {
        const userId = e.data.user_id;
        if (peers.has(userId)) {
          peers.get(userId).joined = false;
        } else {
          // TODO: What if data arrives out of order?
          console.warn(`Unknown peer ${userId}`);
        }
      } else if (e.type === NetworkMessageType.UsernameChange) {
        const userId = e.data.user_id;
        if (peers.has(userId)) {
          const peer = peers.get(userId);
          peer.previousUsername = peer.username;
          peer.username = e.data.username;
        } else {
          // TODO: What if data arrives out of order?
          console.warn(`Unknown peer ${userId}`);
        }
      }
    }
  });

  requestorQuery(world).forEach(eid => {
    // TODO: Wait until the network completion if possible?

    getStateAdapter(world).push(
      NetworkMessageType.UsernameChange,
      {
        username: UsernameChangeRequestorProxy.get(eid).username
      }
    );
    removeComponent(world, UsernameChangeRequestor, eid);
    removeEntityIfNoComponent(world, eid);
  });

  exitRequestorQuery(world).forEach(eid => {
    UsernameChangeRequestorProxy.get(eid).free();
  });
};
