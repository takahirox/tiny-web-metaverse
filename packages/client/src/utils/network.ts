import { addComponent, IWorld } from "bitecs";
import { MathUtils } from "three";
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
export const setupNetworkedEntity = (
  world: IWorld,
  eid: number,
  prefabName: string,
  type: NetworkedType.Local | NetworkedType.Shared
): void => {
  NetworkedInitProxy.get(eid).allocate(world, generateUUID(), prefabName);
  if (type === NetworkedType.Local) {
    addComponent(world, Local, eid);
  } else if (type === NetworkedType.Shared) {
    addComponent(world, Shared, eid);
  } else {
    throw new Error(`Invalid networked type ${type}`);
  }
};
