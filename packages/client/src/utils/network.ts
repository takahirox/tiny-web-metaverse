import { addComponent, IWorld } from "bitecs";
import { MathUtils } from "three";
import { App } from "../app";
import {
  Local,
  NetworkedInitProxy,
  NetworkedType,
  Shared
} from "../components/network";

const generateUUID = (): string => {
  return MathUtils.generateUUID();
};

// For creating local or shared networked entity from local client.
// Networked entity created by remote clients are set up in networked entity system.
export const createNetworkedEntity = (
  world: IWorld,
  // TODO: Remove dependency with App?
  app: App,
  type: NetworkedType.Local | NetworkedType.Shared,
  prefabName: string,
  // TODO: Avoid any
  prefabParams: any = {}
): number => {
  const prefab = app.getPrefab(prefabName);
  const eid = prefab(world, prefabParams);

  if (type === NetworkedType.Local) {
    addComponent(world, Local, eid);
  } else if (type === NetworkedType.Shared) {
    addComponent(world, Shared, eid);
  } else {
    throw new Error(`Invalid networked type ${type}`);
  }

  NetworkedInitProxy.get(eid).allocate(world, generateUUID(), prefabName, prefabParams);

  return eid;
};
