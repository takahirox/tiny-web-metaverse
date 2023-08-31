import { addComponent, defineQuery, IWorld } from "bitecs";
import { Intersection, Vector2, Vector3 } from "three";
import {
  PerspectiveCameraComponent,
  PerspectiveCameraProxy,
  SceneCamera
} from "../components/camera";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";
import {
  MousePosition,
  MousePositionProxy
} from "../components/mouse";
import {
  Raycastable,
  Raycasted,
  RaycasterComponent,
  RaycasterProxy
} from "../components/raycast";
import { NULL_EID } from "../common";

const vec2 = new Vector2();
const vec3 = new Vector3();

const raycasterQuery = defineQuery([RaycasterComponent]);
const cameraQuery = defineQuery([EntityObject3D, PerspectiveCameraComponent, SceneCamera]);
const mouseQuery = defineQuery([MousePosition]);
const raycastableQuery = defineQuery([Raycastable, EntityObject3D]);

export const mouseRaycastSystem = (world: IWorld) => {
  const raycasterEids = raycasterQuery(world);
  const cameraEids = cameraQuery(world);
  const mouseEids = mouseQuery(world);
  const raycastableEids = raycastableQuery(world);

  raycasterEids.forEach(raycasterEid => {
    const raycaster = RaycasterProxy.get(raycasterEid).raycaster;

    cameraEids.forEach(cameraEid => {
      const cameraRoot = EntityObject3DProxy.get(cameraEid).root;
      const camera = PerspectiveCameraProxy.get(cameraEid).camera;

      mouseEids.forEach(mouseEid => {
        const mouseProxy = MousePositionProxy.get(mouseEid);

        raycaster.setFromCamera(vec2.set(mouseProxy.x, mouseProxy.y), camera);

        const intersected: Intersection[] = [];

        let minDistance: number | null = null;
        let raycastedEid: number = NULL_EID;

        // Adds Raycasted component to only the closest object
        // TODO: Optimize
        raycastableEids.forEach(raycastableEid => {
          const obj = EntityObject3DProxy.get(raycastableEid).root;
          intersected.length = 0;
          raycaster.intersectObject(obj, true, intersected);
          if (intersected.length > 0) {
            const distance = intersected[0].distance;
            if (minDistance === null || distance < minDistance) {
              minDistance = distance;
              raycastedEid = raycastableEid;
            }
          }
        });

        if (raycastedEid !== NULL_EID) {
          addComponent(world, Raycasted, raycastedEid);
          vec3.copy(EntityObject3DProxy.get(raycastedEid).root.position).sub(cameraRoot.position);
          Raycasted.distance[raycastedEid] = vec3.length();
        }
      });
    });
  });
};
