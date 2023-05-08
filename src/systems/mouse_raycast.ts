import { addComponent, defineQuery, IWorld } from "bitecs";
import { Intersection, Vector2 } from "three";
import {
  PerspectiveCameraProxy,
  PerspectiveCameraTag,
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
  RaycasterProxy,
  RaycasterTag
} from "../components/raycast";

const vec2 = new Vector2();

const raycasterQuery = defineQuery([RaycasterTag]);
const cameraQuery = defineQuery([PerspectiveCameraTag, SceneCamera]);
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
      const camera = PerspectiveCameraProxy.get(cameraEid).camera;

      mouseEids.forEach(mouseEid => {
        const mouseProxy = MousePositionProxy.get(mouseEid);

        raycaster.setFromCamera(vec2.set(mouseProxy.x, mouseProxy.y), camera);

        const intersected: Intersection[] = [];

        // TODO: Optimize
        // TODO: Add Raycasted component to only the closest object?
        raycastableEids.forEach(raycastableEid => {
          const obj = EntityObject3DProxy.get(raycastableEid).root;
          intersected.length = 0;
          raycaster.intersectObject(obj, true, intersected);
          if (intersected.length > 0) {
            addComponent(world, Raycasted, raycastableEid);
          }
        });
      });
    });
  });
};
