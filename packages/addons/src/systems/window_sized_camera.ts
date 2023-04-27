import {
  defineQuery,
  enterQuery,
  IWorld
} from "bitecs";
import {
  PerspectiveCameraComponent,
  PerspectiveCameraProxy,
  WindowResizeEvent
} from "@tiny-web-metaverse/client/src";

const resize = (eid: number): void => {
  const camera = PerspectiveCameraProxy.get(eid).camera;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};

const enterCameraQuery = enterQuery(defineQuery([PerspectiveCameraComponent]));
const enterCameraWindowResizeQuery =
  enterQuery(defineQuery([PerspectiveCameraComponent, WindowResizeEvent]));

export const windowSizedCameraSystem = (world: IWorld): void => {
  enterCameraQuery(world).forEach(eid => {
    resize(eid);
  });

  enterCameraWindowResizeQuery(world).forEach(eid => {
    resize(eid);
  });
};
