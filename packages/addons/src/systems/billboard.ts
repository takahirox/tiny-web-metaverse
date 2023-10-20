import {
  defineQuery,
  IWorld
} from "bitecs";
import {
  EntityObject3D,
  EntityObject3DProxy,
  PerspectiveCameraComponent,
  SceneCamera
} from "@tiny-web-metaverse/client/src";
import { Billboard } from "../components/billboard";

const billboardQuery = defineQuery([Billboard, EntityObject3D]);
const cameraQuery = defineQuery([EntityObject3D, PerspectiveCameraComponent, SceneCamera]);

export const billboardSystem = (world: IWorld): void => {
  billboardQuery(world).forEach(billboardEid => {
    const billboard = EntityObject3DProxy.get(billboardEid).root;

    // Assumes up to one scene camera
    cameraQuery(world).forEach(cameraEid => {
      const camera = EntityObject3DProxy.get(cameraEid).root;

      // TODO: Improve, especially better "up" controls
      billboard.lookAt(camera.position);
    });
  });
};
