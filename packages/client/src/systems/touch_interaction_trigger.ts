import {
  addComponent,
  defineQuery,
  IWorld
} from "bitecs";
import {
  TouchEvent,
  TouchEventProxy,
  TouchEventType
} from "../components/touch";
import {
  FirstSourceInteractable,
  FirstSourceInteractionLeaveEvent,
  FirstSourceInteractionTriggerEvent
} from "../components/interact";

// TODO: Second source interaction

const firstSourceEventQuery = defineQuery([FirstSourceInteractable, TouchEvent]);

export const touchInteractionTriggerSystem = (world: IWorld) => {
  firstSourceEventQuery(world).forEach(eid => {
    for (const e of TouchEventProxy.get(eid).events) {
      if (e.type === TouchEventType.Start) {
        addComponent(world, FirstSourceInteractionTriggerEvent, eid);
      } else if (e.type === TouchEventType.End) {
        addComponent(world, FirstSourceInteractionLeaveEvent, eid);		  
      }
      // TODO: TouchEventType.Cancel
    }
  });
};
