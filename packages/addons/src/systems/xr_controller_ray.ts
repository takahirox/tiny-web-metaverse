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
  SecondRay,
  XRControllerType,
  XRControllerConnectionEvent,
  XRControllerConnectionEventProxy,
  XRControllerConnectionEventType
} from "@tiny-web-metaverse/client/src";
import {
  FirstXRControllerRay,
  XRControllerRay,
  SecondXRControllerRay
} from "../components/xr_controller_ray";

const firstActiveControllerRayQuery =
  defineQuery([EntityObject3D, FirstXRControllerRay, InScene, XRControllerRay]);
const secondActiveControllerRayQuery =
  defineQuery([EntityObject3D, InScene, SecondXRControllerRay, XRControllerRay]);

// TODO: Only active rays?
const firstRayQuery = defineQuery([FirstRay, RayComponent]);
const secondRayQuery = defineQuery([RayComponent, SecondRay]);

// TODO: Use ActiveXRController instead of XRControllerConnectionEvent?
const firstConnectionEventQuery =
  defineQuery([FirstXRControllerRay, XRControllerConnectionEvent, XRControllerRay]);
const secondConnectionEventQuery =
  defineQuery([SecondXRControllerRay, XRControllerConnectionEvent, XRControllerRay]);

const handleConnection = (world: IWorld, eid: number, type: XRControllerType): void => {
  for (const e of XRControllerConnectionEventProxy.get(eid).events) { 
    if (e.controller !== type) {
      continue;
    }
    if (e.type === XRControllerConnectionEventType.Connected) {
      addComponent(world, InScene, eid);
    } else if (e.type === XRControllerConnectionEventType.Disconnected) {
      removeComponent(world, InScene, eid);
    }
  }
};

const quat = new Quaternion();
const vec3 = new Vector3();

const trackRay = (objEid: number, rayEid: number): void => {
  const root = EntityObject3DProxy.get(objEid).root;
  const ray = RayProxy.get(rayEid).ray;
  // TODO: Optimize and/or simplify
  root.position.copy(ray.origin);
  root.quaternion.copy(quat.setFromUnitVectors(vec3.set(0, 0, -1.0), ray.direction));
};

export const xrControllerRaySystem = (world: IWorld): void => {
  firstConnectionEventQuery(world).forEach(eid => {
    handleConnection(world, eid, XRControllerType.First);
  });

  secondConnectionEventQuery(world).forEach(eid => {
    handleConnection(world, eid, XRControllerType.Second);
  });

  firstActiveControllerRayQuery(world).forEach(objEid => {
    firstRayQuery(world).forEach(rayEid => {
      trackRay(objEid, rayEid);
    });
  });

  secondActiveControllerRayQuery(world).forEach(objEid => {
    secondRayQuery(world).forEach(rayEid => {
      trackRay(objEid, rayEid);
    });
  });
};
