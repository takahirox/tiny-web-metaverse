import {
  addComponent,
  defineQuery,
  IWorld
} from "bitecs";
import {
  MouseButtonEvent,
  MouseButtonEventProxy,
  MouseButtonEventType,
  MouseButtonType
} from "../components/mouse";
import {
  FirstSourceInteractable,
  FirstSourceInteractionLeaveEvent,
  FirstSourceInteractionTriggerEvent,
  SecondSourceInteractable,
  SecondSourceInteractionLeaveEvent,
  SecondSourceInteractionTriggerEvent
} from "../components/interact";

const firstSourceEventQuery = defineQuery([FirstSourceInteractable, MouseButtonEvent]);
const secondSourceEventQuery = defineQuery([SecondSourceInteractable, MouseButtonEvent]);

export const mouseInteractionTriggerSystem = (world: IWorld) => {
  firstSourceEventQuery(world).forEach(eid => {
    for (const e of MouseButtonEventProxy.get(eid).events) {
      if (e.button !== MouseButtonType.Left) {
        continue;
      }
      if (e.type === MouseButtonEventType.Down) {
        addComponent(world, FirstSourceInteractionTriggerEvent, eid);
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
      } else if (e.type === MouseButtonEventType.Up) {
        addComponent(world, SecondSourceInteractionLeaveEvent, eid);
      }
    }
  });
};
