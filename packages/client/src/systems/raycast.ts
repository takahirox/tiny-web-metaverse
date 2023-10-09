import {
  addComponent,
  defineQuery,
  IWorld,
  removeComponent
} from "bitecs";
import { Intersection, Object3D, Vector2, Vector3 } from "three";
import {
  PerspectiveCameraComponent,
  PerspectiveCameraProxy,
  SceneCamera
} from "../components/camera";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";
import { Pointer, PointerProxy } from "../components/pointer";
import {
  Raycastable,
  Raycasted,
  RaycastedNearest,
  RaycasterComponent,
  RaycasterProxy
} from "../components/raycast";

const vec2 = new Vector2();
const vec3 = new Vector3();

const raycasterQuery = defineQuery([RaycasterComponent]);
const cameraQuery = defineQuery([EntityObject3D, PerspectiveCameraComponent, SceneCamera]);
const pointerQuery = defineQuery([Pointer]);
const raycastableQuery = defineQuery([Raycastable, EntityObject3D]);
const raycastedQuery = defineQuery([Raycasted]);
const raycastedNearestQuery = defineQuery([RaycastedNearest]);

export const raycastSystem = (world: IWorld) => {
  const raycasterEids = raycasterQuery(world);
  const cameraEids = cameraQuery(world);
  const pointerEids = pointerQuery(world);
  const raycastableEids = raycastableQuery(world);

  raycasterEids.forEach(raycasterEid => {
    const raycaster = RaycasterProxy.get(raycasterEid).raycaster;

    cameraEids.forEach(cameraEid => {
      const cameraRoot = EntityObject3DProxy.get(cameraEid).root;
      const camera = PerspectiveCameraProxy.get(cameraEid).camera;

      pointerEids.forEach(pointerEid => {
        const pointerProxy = PointerProxy.get(pointerEid);

        raycaster.setFromCamera(vec2.set(pointerProxy.x, pointerProxy.y), camera);

        // TODO: Optimize, here can be a CPU performance bottleneck
        // TODO: Creating arrays and a map every time may be inefficient?
        const intersected: Intersection[] = [];
        const objects: Object3D[] = [];
        const eidMap: Map<Object3D, number> = new Map();

        raycastableEids.forEach(raycastableEid => {
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
            throw new Error('Unfoung object, this should not happen.');
          }

          const raycastedEid = eidMap.get(obj)!;
          addComponent(world, Raycasted, raycastedEid);
          vec3.copy(EntityObject3DProxy.get(raycastedEid).root.position).sub(cameraRoot.position);
          Raycasted.distance[raycastedEid] = vec3.length();
          if (i === 0) {
            addComponent(world, RaycastedNearest, raycastedEid);
          }
        }
      });
    });
  });
};

export const clearRaycastedSystem = (world: IWorld) => {
  raycastedQuery(world).forEach(eid => {
    removeComponent(world, Raycasted, eid);
  });
  raycastedNearestQuery(world).forEach(eid => {
    removeComponent(world, RaycastedNearest, eid);
  });
};