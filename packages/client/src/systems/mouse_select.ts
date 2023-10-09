import {
  addComponent,
  defineQuery,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import {
  MouseButtonEvent,
  MouseButtonEventProxy,
  MouseButtonEventType,
  MouseButtonType
} from "../components/mouse";
import { Raycasted, RaycastedNearest } from "../components/raycast";
import {
  Selectable,
  Selected,
  SelectedEvent,
  SelectedEventListener,
  SelectedEventProxy,
  SelectedType
} from "../components/select";

const addEvent = (world: IWorld, eid: number, type: SelectedType, selectedEid: number): void => {
  if (!hasComponent(world, SelectedEvent, eid)) {
    addComponent(world, SelectedEvent, eid);
    SelectedEventProxy.get(eid).allocate();
  }
  SelectedEventProxy.get(eid).add(type, selectedEid);
};

const eventQuery = defineQuery([MouseButtonEvent, Selectable]);
const listenerQuery = defineQuery([SelectedEventListener]);

export const mouseSelectSystem = (world: IWorld) => {
  eventQuery(world).forEach(eid => {
    for (const e of MouseButtonEventProxy.get(eid).events) {
      if (e.button !== MouseButtonType.Right) {
        continue;
      }
      if (e.type === MouseButtonEventType.Down) {
        let selectedType: SelectedType;
        if (hasComponent(world, Selected, eid)) {
          removeComponent(world, Selected, eid);
          selectedType = SelectedType.Deselected;
        } else if (hasComponent(world, Raycasted, eid) &&
          hasComponent(world, RaycastedNearest, eid)) {
          addComponent(world, Selected, eid);
          selectedType = SelectedType.Selected;
        }
        listenerQuery(world).forEach(listenerEid => {
          addEvent(world, listenerEid, selectedType, eid);
        });
      }
    }
  });
};
