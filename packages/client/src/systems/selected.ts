import { defineQuery, IWorld, removeComponent } from "bitecs";
import { SelectedEvent, SelectedEventProxy } from "../components/select";

const eventQuery = defineQuery([SelectedEvent]);

export const selectedEventClearSystem = (world: IWorld): void => {
  eventQuery(world).forEach(eid => {
    SelectedEventProxy.get(eid).free(); 
    removeComponent(world, SelectedEvent, eid);
  });
};
