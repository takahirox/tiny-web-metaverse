import {
  defineQuery,
  IWorld,
  removeComponent
} from "bitecs";
import { TransformUpdated } from "../components/transform";

const updatedQuery = defineQuery([TransformUpdated]);

export const clearTransformUpdatedSystem = (world: IWorld) => {
  updatedQuery(world).forEach(eid => {
    removeComponent(world, TransformUpdated, eid);
  });	  
};
