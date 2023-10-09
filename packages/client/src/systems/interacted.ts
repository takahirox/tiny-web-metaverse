import {
  defineQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  FirstSourceInteracted,
  FirstSourceInteractionLeaveEvent,
  FirstSourceInteractionTriggerEvent,
  SecondSourceInteracted,
  SecondSourceInteractionLeaveEvent,
  SecondSourceInteractionTriggerEvent
} from "../components/interact";

const firstInteractedQuery = defineQuery([FirstSourceInteracted]);
const firstTriggerEventQuery = defineQuery([FirstSourceInteractionTriggerEvent]);
const firstLeaveEventQuery = defineQuery([FirstSourceInteractionLeaveEvent]);
const secondInteractedQuery = defineQuery([SecondSourceInteracted]);
const secondTriggerEventQuery = defineQuery([SecondSourceInteractionTriggerEvent]);
const secondLeaveEventQuery = defineQuery([SecondSourceInteractionLeaveEvent]);

export const clearInteractionSystem = (world: IWorld): void => {
  firstInteractedQuery(world).forEach(eid => {
    removeComponent(world, FirstSourceInteracted, eid);
  });

  firstTriggerEventQuery(world).forEach(eid => {
    removeComponent(world, FirstSourceInteractionTriggerEvent, eid);
  });

  firstLeaveEventQuery(world).forEach(eid => {
    removeComponent(world, FirstSourceInteractionLeaveEvent, eid);
  });

  secondInteractedQuery(world).forEach(eid => {
    removeComponent(world, SecondSourceInteracted, eid);
  });

  secondTriggerEventQuery(world).forEach(eid => {
    removeComponent(world, SecondSourceInteractionTriggerEvent, eid);
  });

  secondLeaveEventQuery(world).forEach(eid => {
    removeComponent(world, SecondSourceInteractionLeaveEvent, eid);
  });
};
