import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld,
  removeComponent
} from "bitecs";
import { PerspectiveCamera } from "three";
import { EntityRootObject3DProxy } from "../components/entity_root_object3d";
import {
  SceneCameraInitialize,
  sceneCameraProxy,
  SceneCamera
} from "../components/scene_camera";

const initializeQuery = defineQuery([SceneCameraInitialize]);
const initializeEnterQuery = enterQuery(initializeQuery);

const sceneCameraQuery = defineQuery([SceneCamera]);
const sceneCameraExitQuery = exitQuery(sceneCameraQuery);

export const sceneCameraSystem = (world: IWorld): void => {
  initializeEnterQuery(world).forEach(eid => {
    const camera = new PerspectiveCamera();

    const proxy = EntityRootObject3DProxy.get(eid);
    proxy.addObject3D(world, camera);

    sceneCameraProxy.eid = eid;
    sceneCameraProxy.add(world, camera);

    removeComponent(world, SceneCameraInitialize, eid);
  });

  sceneCameraExitQuery(world).forEach(eid => {
    sceneCameraProxy.eid = eid;

    const camera = sceneCameraProxy.camera;

    const proxy = EntityRootObject3DProxy.get(eid);
    proxy.removeObject3D(world, camera);

    sceneCameraProxy.remove(world);
  });
};
