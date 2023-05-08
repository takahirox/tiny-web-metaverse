import { defineQuery, hasComponent, IWorld } from "bitecs";
import { Mesh, MeshBasicMaterial } from "three";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../../src/components/entity_object3d";
import { Raycastable, Raycasted } from "../../src/components/raycast";

const raycastableQuery = defineQuery([EntityObject3D, Raycastable]);

export const raycastedColorSystem = (world: IWorld) => {
  raycastableQuery(world).forEach(eid => {
    const root = EntityObject3DProxy.get(eid).root;
    root.traverse((obj: Mesh) => {
      if (obj.material === undefined) {
        return;
      }
      const material = obj.material as MeshBasicMaterial;
      if (hasComponent(world, Raycasted, eid)) {
        material.color.setHex(0x882222);
      } else {
        material.color.setHex(0x888888);
      }
    });
  });
};
