import { defineComponent } from "bitecs";
import { Quaternion, Vector3 } from "three";
import { NULL_EID } from "@tiny-web-metaverse/client/src";

export const AIAvatar = defineComponent();

export class AIAvatarProxy {
  private static instance: AIAvatarProxy = new AIAvatarProxy();
  private eid: number;
  private map: Map<number, {
    interval: number,
    targetPosition: Vector3,
    targetQuaternion: Quaternion
  }>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): AIAvatarProxy {
    AIAvatarProxy.instance.eid = eid;
    return AIAvatarProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, {
      interval: 0.0,
      targetPosition: new Vector3(),
      targetQuaternion: new Quaternion()
    });
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get interval(): number {
    return this.map.get(this.eid)!.interval;
  }

  set interval(value: number) {
    this.map.get(this.eid)!.interval = value;
  }

  get targetPosition(): Vector3 {
    return this.map.get(this.eid)!.targetPosition;
  }

  get targetQuaternion(): Quaternion {
    return this.map.get(this.eid)!.targetQuaternion;
  }
}

export const AIAvatarCommand = defineComponent();
