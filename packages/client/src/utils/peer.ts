import {
  defineQuery,
  hasComponent,
  IWorld
} from "bitecs";
import { Avatar } from "../components/avatar";
import {
  Local,
  Networked,
  NetworkedProxy,
  Remote
} from "../components/network";
import {
  Peers,
  PeersProxy
} from "../components/peer";
import { getMyUserId } from "./network";

const peersQuery = defineQuery([Peers]);

export const getPeersProxy = (world: IWorld): PeersProxy => {
  // Assumes always single peers entity
  return PeersProxy.get(peersQuery(world)[0]);
};

// TODO: Move this function somewhere else because it has many dependencies?
export const getAvatarUsername = (world: IWorld, eid: number): string | null => {
  if (!hasComponent(world, Avatar, eid)) {
    return null;
  }

  let userId: string | null = null;

  if (hasComponent(world, Local, eid)) {
    userId = getMyUserId(world);
  }

  if (hasComponent(world, Remote, eid) && hasComponent(world, Networked, eid)) {
    userId = NetworkedProxy.get(eid).creator;
  }

  if (userId === null) {
    return null;
  }

  const peers = getPeersProxy(world).peers;

  if (!peers.has(userId)) {
    return null;
  }

  return peers.get(userId)!;
};
