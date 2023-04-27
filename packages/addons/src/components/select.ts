import { defineComponent } from "bitecs";
import { NULL_EID } from "@tiny-web-metaverse/client/src";

export const Selectable = defineComponent();
export const Selected = defineComponent();

export enum SelectedType {
  Deselected,
  Selected
};

export const SelectedEvent = defineComponent();

// TODO: Rename
export type SelectedEventValue = {
  eid: number;
  type: SelectedType;
};

export class SelectedEventProxy {
  private static instance: SelectedEventProxy = new SelectedEventProxy();
  private eid: number;
  private map: Map<number, SelectedEventValue[]>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): SelectedEventProxy {
    SelectedEventProxy.instance.eid = eid;
    return SelectedEventProxy.instance;
  }

  allocate(): void {
    this.map.set(this.eid, []);  
  }

  add(type: SelectedType, eid: number): void {
    this.map.get(this.eid)!.push({ type, eid });
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get events(): SelectedEventValue[] {
    return this.map.get(this.eid)!;
  }
}

export const SelectedEventListener = defineComponent();
