import {
  defineQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  FirstSourceInteracted,
  FirstSourceInteractionTriggerEvent,
  SecondSourceInteracted,
  SecondSourceInteractionTriggerEvent
} from "../components/interact";

const firstEventQuery = defineQuery([FirstSourceInteractionTriggerEvent]);
const firstInteractedQuery = defineQuery([FirstSourceInteracted]);
const secondEventQuery = defineQuery([SecondSourceInteractionTriggerEvent]);
const secondInteractedQuery = defineQuery([SecondSourceInteracted]);

export const clearInteractionSystem = (world: IWorld): void => {
  firstEventQuery(world).forEach(eid => {
    removeComponent(world, FirstSourceInteractionTriggerEvent, eid);
  });

  firstInteractedQuery(world).forEach(eid => {
    removeComponent(world, FirstSourceInteracted, eid);
  });

  secondEventQuery(world).forEach(eid => {
    removeComponent(world, SecondSourceInteractionTriggerEvent, eid);
  });

  secondInteractedQuery(world).forEach(eid => {
    removeComponent(world, SecondSourceInteracted, eid);
  });
};
