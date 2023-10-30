import { addComponent, defineQuery, IWorld } from "bitecs";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";
import { Grabbed } from "../components/grab";
import { FirstRay, RayComponent, RayProxy } from "../components/ray";
import { InScene } from "../components/scene";
import { TransformUpdated } from "../components/transform";

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
