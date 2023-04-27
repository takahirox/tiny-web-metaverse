import { addComponent, defineQuery, IWorld } from "bitecs";
import {
  EntityObject3D,
  EntityObject3DProxy,
  FirstRay,
  InScene,
  RayComponent,
  RayProxy,
  TransformUpdated
} from "@tiny-web-metaverse/client/src";
import { Grabbed } from "../components/grab";

const rayQuery = defineQuery([FirstRay, RayComponent]);
const grabbedQuery = defineQuery([EntityObject3D, Grabbed, InScene]);

export const grabbedObjectsRayTrackSystem = (world: IWorld) => {
  // TODO: Second Ray support in immersive mode?

  rayQuery(world).forEach(rayEid => {
    const ray = RayProxy.get(rayEid).ray;

    grabbedQuery(world).forEach(grabbedEid => {
      EntityObject3DProxy.get(grabbedEid).root
        .position.copy(ray.direction)
        .multiplyScalar(Grabbed.distance[grabbedEid])
        .add(ray.origin);
      addComponent(world, TransformUpdated, grabbedEid);
    });
  });
};
