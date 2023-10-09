import {
  addComponent,
  defineQuery,
  hasComponent,
  IWorld
} from "bitecs";
import {
  TouchEvent,
  TouchEventProxy,
  TouchEventType
} from "../components/touch";
import { RaycastedNearest } from "../components/raycast";
import {
  FirstSourceInteractable,
  FirstSourceInteractionLeaveEvent,
  FirstSourceInteractionTriggerEvent,
  FirstSourceInteracted
} from "../components/interact";

// TODO: Second source interaction

const firstSourceEventQuery = defineQuery([FirstSourceInteractable, TouchEvent]);

export const touchInteractSystem = (world: IWorld) => {
  firstSourceEventQuery(world).forEach(eid => {
    for (const e of TouchEventProxy.get(eid).events) {
      if (e.type === TouchEventType.Start) {
        addComponent(world, FirstSourceInteractionTriggerEvent, eid);
        if (hasComponent(world, RaycastedNearest, eid)) {
          addComponent(world, FirstSourceInteracted, eid);
		}
      } else if (e.type === TouchEventType.End) {
        addComponent(world, FirstSourceInteractionLeaveEvent, eid);		  
      }
      // TODO: TouchEventType.Cancel
    }
  });
};
