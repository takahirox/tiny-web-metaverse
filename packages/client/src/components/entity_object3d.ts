import { defineComponent } from "bitecs";
import { Group, Object3D } from "three";
import { NULL_EID } from "../common";

// TODO: Add MeshComponent or RenderableObject3D component?

// TODO: Move to common?
export class EntityRootGroup extends Group {
  isEntityRootGroup: boolean;
  type: string;

  constructor() {	
    super();
    this.isEntityRootGroup = true;
    this.type = 'EntityRootGroup';
  }
}

export const EntityObject3D = defineComponent();

export class EntityObject3DProxy {
  private static instance: EntityObject3DProxy = new EntityObject3DProxy();
  private eid: number;
  private rootObjectMap: Map<number, Object3D>;
  // TODO: Use Set instead?
  private objectsMap: Map<number, Object3D[]>;
  private groupMap: Map<number, EntityRootGroup>;

  private constructor() {
    this.eid = NULL_EID;
    this.rootObjectMap = new Map();
    this.objectsMap = new Map();
    this.groupMap = new Map();
  }

  static get(eid: number): EntityObject3DProxy {
    EntityObject3DProxy.instance.eid = eid;
    return EntityObject3DProxy.instance;
  }

  allocate(): void {
    const group = new EntityRootGroup();
    this.rootObjectMap.set(this.eid, group);
    this.objectsMap.set(this.eid, []);
    this.groupMap.set(this.eid, group);
  }

  free(): void {
    this.rootObjectMap.delete(this.eid);
    this.objectsMap.delete(this.eid);
    this.groupMap.delete(this.eid);
  }

  get root(): Object3D {
    return this.rootObjectMap.get(this.eid)!;
  }

  set root(obj: Object3D) {
    this.rootObjectMap.set(this.eid, obj);
  }

  get objects(): Object3D[] {
    return this.objectsMap.get(this.eid)!;
  }

  get group(): EntityRootGroup {
    return this.groupMap.get(this.eid)!;
  }
}
