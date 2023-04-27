import { addComponent, defineQuery, IWorld } from "bitecs";
import { MathUtils } from "three";
import { StateAdapter } from "@tiny-web-metaverse/state_client";
import {
  Local,
  Networked,
  NetworkedProxy,
  NetworkedType,
  Shared,
  StateClient,
  StateClientProxy
} from "../components/network";
import { RoomId, RoomIdProxy } from "../components/room_id";
import { UserId, UserIdProxy } from "../components/user_id";
import { getPrefab } from "../utils/prefab";

const generateUUID = (): string => {
  return MathUtils.generateUUID();
};

const localUserIdQuery = defineQuery([Local, UserId]);
const roomIdQuery = defineQuery([RoomId]);
const clientQuery = defineQuery([StateClient]);

export const getMyUserId = (world: IWorld): string => {
  // Assumes always single local user id entity exists
  return UserIdProxy.get(localUserIdQuery(world)[0]).userId;
};

export const getRoomId = (world: IWorld): string => {
  // Assumes always single room id entity exists
  return RoomIdProxy.get(roomIdQuery(world)[0]).roomId;
};

export const getStateAdapter = (world: IWorld): StateAdapter => {
  // Assumes always single state client entity exists
  return StateClientProxy.get(clientQuery(world)[0]).adapter;
};

// For creating local or shared networked entity from local client.
// Networked entity created by remote clients are set up in networked entity system.
export const createNetworkedEntity = (
  world: IWorld,
  type: NetworkedType.Local | NetworkedType.Shared,
  prefabName: string,
  // TODO: Avoid any
  prefabParams: any = {}
): number => {
  const prefab = getPrefab(world, prefabName);
  const eid = prefab(world, prefabParams);

  // Assumes always single user id entity exists
  const userId = getMyUserId(world);

  if (type === NetworkedType.Local) {
    addComponent(world, Local, eid);
  } else if (type === NetworkedType.Shared) {
    addComponent(world, Shared, eid);
  } else {
    throw new Error(`Invalid networked type ${type}`);
  }

  addComponent(world, Networked, eid);
  NetworkedProxy.get(eid).allocate(
    generateUUID(), type, userId, prefabName, prefabParams);

  return eid;
};
