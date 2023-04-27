import {
  addComponent,
  defineQuery,
  enterQuery,
  exitQuery,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import { Mesh, MeshStandardMaterial, Vector3 } from "three";
import { client } from "@gradio/client";
import {
  Grabbable,
  Selectable
} from "@tiny-web-metaverse/addons/src";
import {
  Avatar,
  createNetworkedEntity,
  EntityObject3D,
  EntityObject3DProxy,
  FirstSourceInteractable,
  GltfRoot,
  GltfRootProxy,
  InScene,
  Loading,
  Local,
  MouseButtonEventListener,
  NetworkedType,
  Raycastable,
  removeEntityIfNoComponent,
  SecondSourceInteractable,
  toGenerator,
  TouchEventListener,
  XRControllerSelectEventListener
} from "@tiny-web-metaverse/client/src";
import { TextToModelLoader, TextToModelLoaderProxy } from "../components/text_to_model"

const avatarQuery = defineQuery([Avatar, EntityObject3D, Local]);

const yAxis = new Vector3(0.0, 1.0, 0.0);

function* load(world: IWorld, eid: number): Generator<void, void> {
  addComponent(world, Loading, eid);

  // For external loading effect
  addComponent(world, InScene, eid);
  addComponent(world, Raycastable, eid);
  addComponent(world, MouseButtonEventListener, eid);
  addComponent(world, TouchEventListener, eid);
  addComponent(world, XRControllerSelectEventListener, eid);
  addComponent(world, FirstSourceInteractable, eid);
  addComponent(world, Grabbable, eid);
  addComponent(world, SecondSourceInteractable, eid);
  addComponent(world, Selectable, eid);

  // Place in front of the local avatar
  // TODO: Remove the dependency with avatar from this system.
  //       Move this code to more appropriate place.

  const avatarEids = avatarQuery(world);

  if (avatarEids.length > 0) {
    addComponent(world, EntityObject3D, eid);
    EntityObject3DProxy.get(eid).allocate();
    const root = EntityObject3DProxy.get(eid).root;

    const avatar = EntityObject3DProxy.get(avatarEids[0]).root;
    // TODO: Remove magic number
    root.position.set(0, 0, -2).applyQuaternion(avatar.quaternion);
    root.position.add(avatar.position);
    root.lookAt(avatar.position);
    // z directions seem to be opposite between Three.js and Shap-E?
    // So half rotate on y axis.
    root.rotateOnAxis(yAxis, Math.PI);
  }

  // Send query
  // TODO: Remove magic numbers
  // TODO: Configurable
  const query = TextToModelLoaderProxy.get(eid).query;
  const app = yield* toGenerator(client('hysts/Shap-E', { status_callback: console.log }));
  // TODO: Avoid any if possible
  // TODO: Validation
  const result = (yield* toGenerator(app.predict("/text-to-3d", [query, 0, 15, 64]))) as any;

  // For debug
  console.log(result);

  if (Array.isArray(result.data) &&
    result.data.length > 0 &&
    typeof result.data[0].url === 'string' &&
    result.data[0].url.match(/\.glb$/) !== null) {
    // TODO: Where should we call createNetworkedEntity()?
    //       There may be better place to call.
    const gltfEid = createNetworkedEntity(world, NetworkedType.Shared, 'gltf', { url: result.data[0].url });

    // Move to the loader
    const loaderRoot = EntityObject3DProxy.get(eid).root;
    const gltfRoot = EntityObject3DProxy.get(gltfEid).root;
    gltfRoot.position.copy(loaderRoot.position);
    gltfRoot.quaternion.copy(loaderRoot.quaternion);
    gltfRoot.scale.copy(loaderRoot.scale);
  } else {
    throw new Error(`Unexpected Shap-e result, ${result}`);
  }
}

const loaderQuery = defineQuery([TextToModelLoader]);
const enterLoaderQuery = enterQuery(loaderQuery);
const exitLoaderQuery = exitQuery(loaderQuery);

const enterGltfQuery = enterQuery(defineQuery([GltfRoot]));

const generators = new Map<number, Generator>();

export const textToModelLoadSystem = (world: IWorld): void => {
  enterLoaderQuery(world).forEach(eid => {
    generators.set(eid, load(world, eid));
  });

  loaderQuery(world).forEach(eid => {
    let done = false;
    try {
      if (generators.get(eid).next().done === true) {
        done = true;
      }
    } catch (error) {
      // TODO: Proper error handling
      console.error(error);
      done = true;
    }
    if (done) {
      removeComponent(world, TextToModelLoader, eid);
      removeComponent(world, Loading, eid);
    }
  })

  exitLoaderQuery(world).forEach(eid => {
    generators.delete(eid);
    TextToModelLoaderProxy.get(eid).free();
    if (hasComponent(world, Loading, eid)) {
      removeComponent(world, Loading, eid);
    }

    removeComponent(world, InScene, eid);
    removeComponent(world, Raycastable, eid);
    removeComponent(world, MouseButtonEventListener, eid);
    removeComponent(world, TouchEventListener, eid);
    removeComponent(world, XRControllerSelectEventListener, eid);
    removeComponent(world, FirstSourceInteractable, eid);
    removeComponent(world, Grabbable, eid);
    removeComponent(world, SecondSourceInteractable, eid);
    removeComponent(world, Selectable, eid);

    // TODO: Remove entity properly when loading is done
    removeEntityIfNoComponent(world, eid);
  });

  enterGltfQuery(world).forEach(eid => {
    // A hack. Shap-E models look black in AR mode maybe because
    // of null scene.background and scene.environment.
    // Changing material.metalness from 1.0 to small seems to be
    // a workaround for now.
    GltfRootProxy.get(eid).root.traverse(obj => {
      const mesh = obj as Mesh;
      if (mesh.isMesh !== true) {
        return;
      }
      // A detection of Shap-E models.
      // This may be fragile because it can be affected by Shap-E update.
      // Keep an eye on Shap-E, or fix the root issue.
      if ('file_name' in mesh.userData &&
        'file_path' in mesh.userData &&
        'name' in mesh.userData &&
        'processed' in mesh.userData) {
        const material = mesh.material as MeshStandardMaterial;
        if (material.metalness > 0.1) {
          material.metalness = 0.1;
        }
      }
    });
  });
};
