import {
  addComponent,
  defineQuery,
  IWorld
} from "bitecs";
import {
  FirstSourceInteractable,
  FirstSourceInteractionLeaveEvent,
  FirstSourceInteractionTriggerEvent,
  SecondSourceInteractable,
  SecondSourceInteractionLeaveEvent,
  SecondSourceInteractionTriggerEvent,
  XRControllerSelectEvent,
  XRControllerSelectEventProxy,
  XRControllerSelectEventType,
  XRControllerType
} from "@tiny-web-metaverse/client/src";

const firstInteractableQuery = defineQuery([FirstSourceInteractable, XRControllerSelectEvent]);
const secondInteractableQuery = defineQuery([SecondSourceInteractable, XRControllerSelectEvent]);

export const webxrControllerInteractionTriggerSystem = (world: IWorld): void => {
  firstInteractableQuery(world).forEach(eid => {
    for (const e of XRControllerSelectEventProxy.get(eid).events) {
      if (e.controller !== XRControllerType.First) {
        continue;
      }
      if (e.type === XRControllerSelectEventType.Start) {
        addComponent(world, FirstSourceInteractionTriggerEvent, eid);
      } else if (e.type === XRControllerSelectEventType.End) {
        addComponent(world, FirstSourceInteractionLeaveEvent, eid);
      }
    }
  });

  secondInteractableQuery(world).forEach(eid => {
    for (const e of XRControllerSelectEventProxy.get(eid).events) {
      if (e.controller !== XRControllerType.Second) {
        continue;
      }
      if (e.type === XRControllerSelectEventType.Start) {
        addComponent(world, SecondSourceInteractionTriggerEvent, eid);
      } else if (e.type === XRControllerSelectEventType.End) {
        addComponent(world, SecondSourceInteractionLeaveEvent, eid);
      }
    }
  });
};
