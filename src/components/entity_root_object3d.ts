import {
  addComponent,
  defineComponent,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import { Group, Object3D } from "three";
import { NULL_EID } from "../common";

export const EntityRootObject3D = defineComponent();
const RootObject3DMap = new Map<number, Object3D>();
const Object3DsMap = new Map<number, Object3D[]>();
const GroupMap = new Map<number, EntityRootGroup>();

export class EntityRootGroup extends Group {
  isEntityRootGroup: boolean;
  type: string;

  constructor() {	
    super();
    this.isEntityRootGroup = true;
    this.type = 'EntityRootGroup';
  }
}

// Ensures that objects associated with an entity form
// the following depending on the number of objects
//   0:  EntityRootGroup (Root)
//   1:  Object3D        (Root)
//   2-: EntityRootGroup (Root) - Object3DA
//                              - Object3DB
//                              - ...

export class EntityRootObject3DProxy {
  private static instance: EntityRootObject3DProxy = new EntityRootObject3DProxy();
  private eid: number;

  private constructor() {
    this.eid = NULL_EID;
  }

  static get(eid: number): EntityRootObject3DProxy {
    EntityRootObject3DProxy.instance.eid = eid;
    return EntityRootObject3DProxy.instance;
  }

  allocate(world: IWorld): void {
    addComponent(world, EntityRootObject3D, this.eid);
    const group = new EntityRootGroup();
    RootObject3DMap.set(this.eid, group);
    Object3DsMap.set(this.eid, []);
    GroupMap.set(this.eid, group);
  }

  free(world: IWorld): void {
    removeComponent(world, EntityRootObject3D, this.eid);
    RootObject3DMap.delete(this.eid);
    Object3DsMap.delete(this.eid);
    GroupMap.delete(this.eid);
  }

  addObject3D(world: IWorld, obj: Object3D): void {
    if (!hasComponent(world, EntityRootObject3D, this.eid)) {
      this.allocate(world);
    }

    const objects = this.objects;

    if (objects.length === 0) {
      this.swapRootObject3D(obj);
    } else {
      if (objects.length === 1) {
        const oldRootObj = this.swapRootObject3D(this.group);
        this.root.add(oldRootObj);
      }
      this.root.add(obj);
    }

    objects.push(obj);
  }

  removeObject3D(world: IWorld, obj: Object3D): void {
    if (!hasComponent(world, EntityRootObject3D, this.eid)) {
      // Throw an error?
      return;
    }

    const index = this.objects.indexOf(obj)

    if (index === -1) {
      // Throw an error?
      return;
    }

    this.objects.splice(index, 1);
    if (this.objects.length === 0) {
      this.swapRootObject3D(this.group);
    } else {
      this.root.remove(obj);
      if (this.objects.length === 1) {
        this.swapRootObject3D(this.objects[0]);
      }
    }
  }

  private swapRootObject3D(newRoot: Object3D): Object3D {
    const oldRoot = this.root;

    Object3D.prototype.copy.call(newRoot, oldRoot);

    if (oldRoot.parent !== null) {
      oldRoot.parent.add(newRoot);
      oldRoot.parent.remove(oldRoot);
    }

    while (oldRoot.children.length > 0) {
      newRoot.add(oldRoot.children[0]);
    }

    //
    this.root = newRoot;

    oldRoot.matrixWorld.identity();
    oldRoot.matrix.identity().decompose(
      oldRoot.position,
      oldRoot.quaternion,
      oldRoot.scale
    );

    return oldRoot;
  }


  get root(): Object3D {
    return RootObject3DMap.get(this.eid)!;
  }

  private set root(obj: Object3D) {
    RootObject3DMap.set(this.eid, obj);
  }

  private get objects(): Object3D[] {
    return Object3DsMap.get(this.eid)!;
  }

  private get group(): EntityRootGroup {
    return GroupMap.get(this.eid)!;
  }
}
