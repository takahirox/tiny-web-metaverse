import {
  addComponent,
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
import {
  RaycastedNearest,
  RaycastedNearestByFirstRay,
  RaycastedNearestBySecondRay
} from "../components/raycast";
import { isXRPresenting } from "../utils/webxr";

const firstSourceInteractableQuery =
  defineQuery([FirstSourceInteractionTriggerEvent, RaycastedNearest, RaycastedNearestByFirstRay]);
const secondSourceInteractableQuery =
  defineQuery([RaycastedNearest, RaycastedNearestByFirstRay, SecondSourceInteractionTriggerEvent]);

// Hack: Second source is interactable only by second ray in immersive mode.
// TODO: This hack maybe error prone. Think simpler approach
const secondSourceInteractableInImmersiveModeQuery =
  defineQuery([RaycastedNearest, RaycastedNearestBySecondRay, SecondSourceInteractionTriggerEvent]);

const firstInteractedQuery = defineQuery([FirstSourceInteracted]);
const firstTriggerEventQuery = defineQuery([FirstSourceInteractionTriggerEvent]);
const firstLeaveEventQuery = defineQuery([FirstSourceInteractionLeaveEvent]);
const secondInteractedQuery = defineQuery([SecondSourceInteracted]);
const secondTriggerEventQuery = defineQuery([SecondSourceInteractionTriggerEvent]);
const secondLeaveEventQuery = defineQuery([SecondSourceInteractionLeaveEvent]);

export const interactSystem = (world: IWorld) => {
  firstSourceInteractableQuery(world).forEach(eid => {
    addComponent(world, FirstSourceInteracted, eid);
  });

  (isXRPresenting(world)
    ? secondSourceInteractableInImmersiveModeQuery
    : secondSourceInteractableQuery
  )(world).forEach(eid => {
    addComponent(world, SecondSourceInteracted, eid);
  });
};

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
