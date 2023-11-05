import {
  addComponent,
  defineQuery,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import {
  Intersection,
  Matrix4,
  Mesh,
  Raycaster,
  Vector3
} from "three";
import { MeshBVH } from 'three-mesh-bvh';
import { NULL_EID } from "../common";
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
  RaycastedNearestBySecondRay
} from "../components/raycast";

const vec3 = new Vector3();
const invMat4 = new Matrix4();
const raycaster = new Raycaster();

const rayQuery = defineQuery([ActiveRay, RayComponent]);
const raycastableQuery = defineQuery([Raycastable, EntityObject3D]);

const raycastedQuery = defineQuery([Raycasted]);
const firstRaycastedQuery = defineQuery([RaycastedByFirstRay]);
const secondRaycastedQuery = defineQuery([RaycastedBySecondRay]);
const raycastedNearestQuery = defineQuery([RaycastedNearest]);
const firstRaycastedNearestQuery = defineQuery([RaycastedNearestByFirstRay]);
const secondRaycastedNearestQuery = defineQuery([RaycastedNearestBySecondRay]);

const ascSort = (a: Intersection, b: Intersection) => {
  return a.distance - b.distance;
};

// TODO: Simplify and optimize

export const raycastSystem = (world: IWorld) => {
  rayQuery(world).forEach(rayEid => {
    const ray = RayProxy.get(rayEid).ray;

    raycaster.ray.copy(ray);

    // TODO: Clean up and optimize if possible
    // TODO: Store distance for first and second ray separately
    let nearestEid = NULL_EID;
    let nearestDistance = Infinity;

    raycastableQuery(world).forEach(eid => {
      const root = EntityObject3DProxy.get(eid).root;
      const hits: Intersection[] = [];

      root.traverse(obj => {
        const mesh = obj as Mesh;

        if (mesh.isMesh !== true) {
          return;
        }

        // BVH is stored at geometry in bvh system.
        // TODO: Avoid any
        const bvh = (mesh.geometry as any).boundsTree as MeshBVH;

        if (bvh) {
          invMat4.copy(mesh.matrixWorld).invert();
          raycaster.ray.applyMatrix4(invMat4);
          const hit = bvh.raycastFirst(raycaster.ray, mesh.material);
          if (hit) {
            // TODO: Ensure world matrix is up to date?
            hit.point.applyMatrix4(mesh.matrixWorld);
            hit.distance = hit.point.distanceTo(ray.origin);
            hit.object = mesh;

            if (hit.distance >= raycaster.near && hit.distance <= raycaster.far) {
              hits.push(hit);
            }
          }
          raycaster.ray.copy(ray);
        } else {
          // Use regular raycaster as fallback if no BVH
          for (const hit of raycaster.intersectObject(mesh, false)) {
            hits.push(hit);
          }
        }
      });

      if (hits.length === 0) {
        return;
      }

      // TODO: Optimization, avoid sort
      const hit = hits.sort(ascSort)[0];

      if (hit.distance < nearestDistance) {
        nearestDistance = hit.distance;
        nearestEid = eid;
      }

      addComponent(world, Raycasted, eid);;

      vec3.copy(EntityObject3DProxy.get(eid).root.position).sub(ray.origin);
      Raycasted.distance[eid] = vec3.length();

      if (hasComponent(world, FirstRay, rayEid)) {
        addComponent(world, RaycastedByFirstRay, eid);
      }
      if (hasComponent(world, SecondRay, rayEid)) {
        addComponent(world, RaycastedBySecondRay, eid);
      }
    });

    if (nearestEid !== NULL_EID) {
      addComponent(world, RaycastedNearest, nearestEid);

      if (hasComponent(world, FirstRay, rayEid)) {
        addComponent(world, RaycastedNearestByFirstRay, nearestEid);
      }
      if (hasComponent(world, SecondRay, rayEid)) {
        addComponent(world, RaycastedNearestBySecondRay, nearestEid);
      }
    }
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
