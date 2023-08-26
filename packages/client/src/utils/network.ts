import { addComponent, defineQuery, IWorld } from "bitecs";
import { MathUtils } from "three";
import {
  Local,
  Networked,
  NetworkedProxy,
  NetworkedType,
  Shared
} from "../components/network";
import { UserId, UserIdProxy } from "../components/user_id";
import { getPrefab } from "../utils/prefab";

const generateUUID = (): string => {
  return MathUtils.generateUUID();
};

const userIdQuery = defineQuery([UserId]);

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
  const userId = UserIdProxy.get(userIdQuery(world)[0]).userId;

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
