import {
  addComponent,
  defineQuery,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import {
  SecondSourceInteracted,
  SecondSourceInteractionTriggerEvent
} from "@tiny-web-metaverse/client/src";
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

// TODO: Should what source to select be configurable?
const triggerQuery = defineQuery([SecondSourceInteractionTriggerEvent, Selectable]);
const listenerQuery = defineQuery([SelectedEventListener]);
const selectedEventQuery = defineQuery([SelectedEvent]);

export const selectSystem = (world: IWorld) => {
  triggerQuery(world).forEach(eid => {
    if (hasComponent(world, Selected, eid)) {
      removeComponent(world, Selected, eid);
      listenerQuery(world).forEach(listenerEid => {
        addEvent(world, listenerEid, SelectedType.Deselected, eid);
      });
    } else if (hasComponent(world, SecondSourceInteracted, eid)) {
      addComponent(world, Selected, eid);
      listenerQuery(world).forEach(listenerEid => {
        addEvent(world, listenerEid, SelectedType.Selected, eid);
      });
    }
  });
};

export const selectedEventClearSystem = (world: IWorld): void => {
  selectedEventQuery(world).forEach(eid => {
    SelectedEventProxy.get(eid).free(); 
    removeComponent(world, SelectedEvent, eid);
  });
};
