import {
  defineQuery,
  exitQuery,
  IWorld
} from "bitecs";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";

const objectExitQuery = exitQuery(defineQuery([EntityObject3D]));

export const entityObject3DSystem = (world: IWorld): void => {
  objectExitQuery(world).forEach(eid => {
    EntityObject3DProxy.get(eid).free(); 
  });
};
