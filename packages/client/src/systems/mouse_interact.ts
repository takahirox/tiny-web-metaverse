import {
  addComponent,
  defineQuery,
  hasComponent,
  IWorld
} from "bitecs";
import {
  MouseButtonEvent,
  MouseButtonEventProxy,
  MouseButtonEventType,
  MouseButtonType
} from "../components/mouse";
import { RaycastedNearest } from "../components/raycast";
import {
  FirstSourceInteractable,
  FirstSourceInteractionLeaveEvent,
  FirstSourceInteractionTriggerEvent,
  FirstSourceInteracted,
  SecondSourceInteractable,
  SecondSourceInteractionLeaveEvent,
  SecondSourceInteractionTriggerEvent,
  SecondSourceInteracted
} from "../components/interact";

const firstSourceEventQuery = defineQuery([FirstSourceInteractable, MouseButtonEvent]);
const secondSourceEventQuery = defineQuery([SecondSourceInteractable, MouseButtonEvent]);

// TODO: Optimize and/or Simplify
export const mouseInteractSystem = (world: IWorld) => {
  firstSourceEventQuery(world).forEach(eid => {
    for (const e of MouseButtonEventProxy.get(eid).events) {
      if (e.button !== MouseButtonType.Left) {
        continue;
      }
      if (e.type === MouseButtonEventType.Down) {
        addComponent(world, FirstSourceInteractionTriggerEvent, eid);
        if (hasComponent(world, RaycastedNearest, eid)) {
          addComponent(world, FirstSourceInteracted, eid);
		}
      } else if (e.type === MouseButtonEventType.Up) {
        addComponent(world, FirstSourceInteractionLeaveEvent, eid);
      }
    }
  });

  secondSourceEventQuery(world).forEach(eid => {
    for (const e of MouseButtonEventProxy.get(eid).events) {
      if (e.button !== MouseButtonType.Right) {
        continue;
      }
      if (e.type === MouseButtonEventType.Down) {
        addComponent(world, SecondSourceInteractionTriggerEvent, eid);
        if (hasComponent(world, RaycastedNearest, eid)) {
          addComponent(world, SecondSourceInteracted, eid);
		}
      } else if (e.type === MouseButtonEventType.Up) {
        addComponent(world, SecondSourceInteractionLeaveEvent, eid);
      }
    }
  });
};
