import { addComponent, IWorld } from "bitecs";
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial
} from "three";
import { addObject3D } from "@tiny-web-metaverse/client/src";
import { XRControllerRay, XRControllerRayProxy } from "../components/xr_controller_ray";

// TODO: Configurable
const RAY_LENGTH = 10.0;

export const addXRControllerRayComponent = (world: IWorld, eid: number): void => {
  addComponent(world, XRControllerRay, eid);

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 0, 0, -RAY_LENGTH], 3));
  geometry.setAttribute('color', new Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3));
  const material = new LineBasicMaterial({ vertexColors: true, blending: AdditiveBlending });
  const line = new Line(geometry, material);

  XRControllerRayProxy.get(eid).allocate(line);
  addObject3D(world, line, eid);
};
