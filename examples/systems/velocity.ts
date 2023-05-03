import { defineQuery, IWorld } from "bitecs";
import {
  EntityRootObject3D,
  EntityRootObject3DProxy
} from "../../src/components/entity_root_object3d";
import { Velocity } from "../components/velocity";

const velocityQuery = defineQuery([Velocity, EntityRootObject3D]);

export const velocitySystem = (world: IWorld) => {
  velocityQuery(world).forEach(eid => {
    const proxy = EntityRootObject3DProxy.get(eid);
    const obj = proxy.root;
    obj.position.x += Velocity.x[eid];
    obj.position.y += Velocity.y[eid];
    obj.position.z += Velocity.z[eid];
  });
};
