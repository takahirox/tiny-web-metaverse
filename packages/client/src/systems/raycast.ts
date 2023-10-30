import {
  addComponent,
  defineQuery,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import { Intersection, Object3D, Vector3 } from "three";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";
import {
  ActiveRay,
  FirstRay,
  RayComponent,
  RayProxy,
  SecondRay
} from "../components/ray";
import {
  Raycastable,
  Raycasted,
  RaycastedByFirstRay,
  RaycastedBySecondRay,
  RaycastedNearest,
  RaycastedNearestByFirstRay,
  RaycastedNearestBySecondRay,
  RaycasterComponent,
  RaycasterProxy
} from "../components/raycast";

const vec3 = new Vector3();

const raycasterQuery = defineQuery([RaycasterComponent]);

const rayQuery = defineQuery([ActiveRay, RayComponent]);
const raycastableQuery = defineQuery([Raycastable, EntityObject3D]);

const raycastedQuery = defineQuery([Raycasted]);
const firstRaycastedQuery = defineQuery([RaycastedByFirstRay]);
const secondRaycastedQuery = defineQuery([RaycastedBySecondRay]);
const raycastedNearestQuery = defineQuery([RaycastedNearest]);
const firstRaycastedNearestQuery = defineQuery([RaycastedNearestByFirstRay]);
const secondRaycastedNearestQuery = defineQuery([RaycastedNearestBySecondRay]);

// TODO: Simplify and optimize

export const raycastSystem = (world: IWorld) => {
  raycasterQuery(world).forEach(raycasterEid => {
    const raycaster = RaycasterProxy.get(raycasterEid).raycaster;

    rayQuery(world).forEach(rayEid => {
      const ray = RayProxy.get(rayEid).ray;

      raycaster.ray.copy(ray);

      // TODO: Optimize, here can be a CPU performance bottleneck
      // TODO: Creating arrays and a map every time may be inefficient?
      const intersected: Intersection[] = [];
      const objects: Object3D[] = [];
      const eidMap: Map<Object3D, number> = new Map();

      raycastableQuery(world).forEach(raycastableEid => {
        const obj = EntityObject3DProxy.get(raycastableEid).root;
        objects.push(obj);
        eidMap.set(obj, raycastableEid);
      });

      raycaster.intersectObjects(objects, true, intersected);

      for (let i = 0; i < intersected.length; i++) {
        // TODO: Clean up if possible
        let obj = intersected[i].object;

        while (obj !== null) {
          if (eidMap.has(obj)) {
            break;
          }
          obj = obj.parent;
        }

        if (obj === null) {
          throw new Error('Unfound object, this should not happen.');
        }

        const raycastedEid = eidMap.get(obj)!;
        addComponent(world, Raycasted, raycastedEid);

        if (hasComponent(world, FirstRay, rayEid)) {
          addComponent(world, RaycastedByFirstRay, raycastedEid);
        }
        if (hasComponent(world, SecondRay, rayEid)) {
          addComponent(world, RaycastedBySecondRay, raycastedEid);
        }

        vec3.copy(EntityObject3DProxy.get(raycastedEid).root.position).sub(ray.origin);
        Raycasted.distance[raycastedEid] = vec3.length();

        if (i === 0) {
          addComponent(world, RaycastedNearest, raycastedEid);

          if (hasComponent(world, FirstRay, rayEid)) {
            addComponent(world, RaycastedNearestByFirstRay, raycastedEid);
          }
          if (hasComponent(world, SecondRay, rayEid)) {
            addComponent(world, RaycastedNearestBySecondRay, raycastedEid);
          }
        }
      }
    });
  });
};

export const clearRaycastedSystem = (world: IWorld) => {
  raycastedQuery(world).forEach(eid => {
    removeComponent(world, Raycasted, eid);
  });

  firstRaycastedQuery(world).forEach(eid => {
    removeComponent(world, RaycastedByFirstRay, eid);
  });

  secondRaycastedQuery(world).forEach(eid => {
    removeComponent(world, RaycastedBySecondRay, eid);
  });

  raycastedNearestQuery(world).forEach(eid => {
    removeComponent(world, RaycastedNearest, eid);
  });

  firstRaycastedNearestQuery(world).forEach(eid => {
    removeComponent(world, RaycastedNearestByFirstRay, eid);
  });

  secondRaycastedNearestQuery(world).forEach(eid => {
    removeComponent(world, RaycastedNearestBySecondRay, eid);
  });
};
