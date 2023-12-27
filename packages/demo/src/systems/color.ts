import {
  defineQuery,
  hasComponent,
  IWorld
} from "bitecs";
import {
  type Mesh,
  type MeshBasicMaterial,
  type MeshStandardMaterial
} from "three";
import {
  Grabbed,
  Selected
} from "@tiny-web-metaverse/addons/src";
import {
  EntityObject3D,
  EntityObject3DProxy,
  Raycastable,
  RaycastedNearest,
} from "@tiny-web-metaverse/client/src";

const query = defineQuery([EntityObject3D, Raycastable]);
const grabbedQuery = defineQuery([Grabbed]);

export const colorSystem = (world: IWorld) => {
  const grabbedExist = grabbedQuery(world).length > 0;

  query(world).forEach(eid => {
    const root = EntityObject3DProxy.get(eid).root;

    root.traverse(obj => {
      if ((obj as Mesh).material === undefined) {
        return;
      }

      const material = (obj as Mesh).material as MeshStandardMaterial;
      const color = 'emissive' in material
        ? material.emissive
        : (material as MeshBasicMaterial).color;

      if (material.userData.color === undefined) {
        material.userData.color = color.clone();
      }

      if (hasComponent(world, Grabbed, eid)) {
        color.setHex(0x2222aa);
      } else if (hasComponent(world, Selected, eid)) {
        color.setHex(0x22aa22);
      } else if (!grabbedExist && hasComponent(world, RaycastedNearest, eid)) {
        color.setHex(0xaa2222);
      } else {
        color.copy(material.userData.color);
      }
    });
  });
};
