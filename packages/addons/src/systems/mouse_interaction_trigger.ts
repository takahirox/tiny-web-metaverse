import {
  addComponent,
  defineQuery,
  IWorld
} from "bitecs";
import {
  FirstSourceInteractable,
  FirstSourceInteractionLeaveEvent,
  FirstSourceInteractionTriggerEvent,
  MouseButtonEvent,
  MouseButtonEventProxy,
  MouseButtonEventType,
  MouseButtonType,
  SecondSourceInteractable,
  SecondSourceInteractionLeaveEvent,
  SecondSourceInteractionTriggerEvent
} from "@tiny-web-metaverse/client/src";

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
