import {
  addComponent,
  defineQuery,
  IWorld,
  removeComponent
} from "bitecs";
import { Quaternion, Vector3 } from "three";
import {
  EntityObject3D,
  EntityObject3DProxy,
  FirstRay,
  InScene,
  RayComponent,
  RayProxy,
  XRControllerType,
  XRControllerConnectionEvent,
  XRControllerConnectionEventProxy,
  XRControllerConnectionEventType
} from "@tiny-web-metaverse/client/src";
import { XRControllerRay } from "../components/xr_controller_ray";

const quat = new Quaternion();
const vec3 = new Vector3();

// TODO: Implement Second ray

const rayQuery = defineQuery([FirstRay, RayComponent]);
const controllerRayQuery = defineQuery([EntityObject3D, InScene, XRControllerRay]);
const connectionEventQuery = defineQuery([XRControllerConnectionEvent, XRControllerRay]);

export const xrControllerRaySystem = (world: IWorld): void => {
  connectionEventQuery(world).forEach(eid => {
    for (const e of XRControllerConnectionEventProxy.get(eid).events) { 
      if (e.controller !== XRControllerType.First) {
        continue;
      }
      if (e.type === XRControllerConnectionEventType.Connected) {
        addComponent(world, InScene, eid);
      } else if (e.type === XRControllerConnectionEventType.Disconnected) {
        removeComponent(world, InScene, eid);
      }
    }
  });

  controllerRayQuery(world).forEach(objEid => {
    const root = EntityObject3DProxy.get(objEid).root;
    rayQuery(world).forEach(rayEid => {
      const ray = RayProxy.get(rayEid).ray;
      // TODO: Optimize and/or simplify
      root.position.copy(ray.origin);
      root.quaternion.copy(quat.setFromUnitVectors(vec3.set(0, 0, -1.0), ray.direction));
    });
  });
};
