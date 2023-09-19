import { defineComponent } from "bitecs";
import { AnimationAction, AnimationMixer } from "three";
import { NULL_EID } from "../common";

export const MixerAnimation = defineComponent();

export class MixerAnimationProxy {
  private static instance: MixerAnimationProxy = new MixerAnimationProxy();
  private eid: number;
  private map: Map<number, AnimationMixer>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): MixerAnimationProxy {
    MixerAnimationProxy.instance.eid = eid;
    return MixerAnimationProxy.instance;
  }

  allocate(mixer: AnimationMixer): void {
    this.map.set(this.eid, mixer);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get mixer(): AnimationMixer {
    return this.map.get(this.eid)!;
  }
}

export const ActiveAnimations = defineComponent();

export class ActiveAnimationsProxy {
  private static instance: ActiveAnimationsProxy = new ActiveAnimationsProxy();
  private eid: number;
  private map: Map<number, AnimationAction[]>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): ActiveAnimationsProxy {
    ActiveAnimationsProxy.instance.eid = eid;
    return ActiveAnimationsProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, []);
  }

  add(action: AnimationAction): void {
    this.map.get(this.eid).push(action);
  }

  remove(action: AnimationAction): void {
    const actions = this.actions;
    const index = actions.indexOf(action);
    if (index === -1) {
      return;
    }
    actions.splice(index, 1);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get actions(): AnimationAction[] {
    return this.map.get(this.eid)!;
  }
}

export const ActiveAnimationsUpdated = defineComponent();

export const LazyActiveAnimations = defineComponent();

type LazyActiveAnimationsValue = {
  index: number,
  paused: boolean,
  startedAt: number
};

export class LazyActiveAnimationsProxy {
  private static instance: LazyActiveAnimationsProxy = new LazyActiveAnimationsProxy();
  private eid: number;
  private map: Map<number, LazyActiveAnimationsValue[]>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): LazyActiveAnimationsProxy {
    LazyActiveAnimationsProxy.instance.eid = eid;
    return LazyActiveAnimationsProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, []);
  }

  add(index: number, startedAt: number, paused: boolean): void {
    this.map.get(this.eid)!.push({ index, paused, startedAt });
  }

  clear(): void {
    this.map.get(this.eid)!.length = 0;
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get animations(): LazyActiveAnimationsValue[] {
    return this.map.get(this.eid)!;
  }
}
