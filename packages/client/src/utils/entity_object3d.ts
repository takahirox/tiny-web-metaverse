import {
  addComponent,
  hasComponent,
  IWorld,
} from "bitecs";
import { Object3D } from "three";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";

// Ensures that objects associated with an entity form
// the following depending on the number of objects
//   0:  EntityRootGroup (Root)
//   1:  Object3D        (Root)
//   2-: EntityRootGroup (Root) - Object3D_A
//                              - Object3D_B
//                              - ...

export const addObject3D = (world: IWorld, obj: Object3D, eid: number): void => {
  const proxy = EntityObject3DProxy.get(eid);

  if (!hasComponent(world, EntityObject3D, eid)) {
    addComponent(world, EntityObject3D, eid);
    proxy.allocate();
  }

  const objects = proxy.objects;

  if (objects.length === 0) {
    swapRootObject3D(obj, eid, false);
  } else {
    if (objects.length === 1) {
      const oldRootObj = swapRootObject3D(proxy.group, eid, false);
      proxy.root.add(oldRootObj);
    }
    proxy.root.add(obj);
  }

  objects.push(obj);
};

export const removeObject3D = (world: IWorld, obj: Object3D, eid: number): void => {
  // TODO: Really needs a check?
  if (!hasObject3D(world, obj, eid)) {
    // Throw an error?
    return;
  }

  const proxy = EntityObject3DProxy.get(eid);
  const index = proxy.objects.indexOf(obj)

  proxy.objects.splice(index, 1);

  if (proxy.objects.length === 0) {
    swapRootObject3D(proxy.group, eid, false);
  } else {
    proxy.root.remove(obj);
    if (proxy.objects.length === 1) {
      swapRootObject3D(proxy.objects[0], eid, true);
    }
  }
};

// TODO: Optimize
export const hasObject3D = (world: IWorld, obj: Object3D, eid: number): boolean => {
  if (!hasComponent(world, EntityObject3D, eid)) {
    // Throw an error?
    return false;
  }
  return EntityObject3DProxy.get(eid).objects.indexOf(obj) !== -1;
};

const swapRootObject3D = (
  newRoot: Object3D,
  eid: number,
  moveChildren: boolean
): Object3D => {
  const proxy = EntityObject3DProxy.get(eid);
  const oldRoot = proxy.root;

  // We don't copy animations because animations must be attached to
  // an object rather than root entity object.
  const animations = newRoot.animations;
  Object3D.prototype.copy.call(newRoot, oldRoot, false);
  newRoot.animations = animations;

  if (oldRoot.parent !== null) {
    oldRoot.parent.add(newRoot);
    oldRoot.parent.remove(oldRoot);
  }

  if (moveChildren) {
    while (oldRoot.children.length > 0) {
      newRoot.add(oldRoot.children[0]);
    }
  }

  // TODO: Write comment
  // TODO: Move visibility, too?

  proxy.root = newRoot;

  oldRoot.matrixWorld.identity();
  oldRoot.matrix.identity().decompose(
    oldRoot.position,
    oldRoot.quaternion,
    oldRoot.scale
  );

  return oldRoot;
};
