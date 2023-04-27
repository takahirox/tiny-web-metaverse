import { defineComponent } from "bitecs";

// Assumes
//   First source: Mouse left click
//   Second source: Mouse right click
// TODO: Rename

export const FirstSourceInteractable = defineComponent();
export const FirstSourceInteracted = defineComponent();
export const FirstSourceInteractionTriggerEvent = defineComponent();
export const FirstSourceInteractionLeaveEvent = defineComponent();

export const SecondSourceInteractable = defineComponent();
export const SecondSourceInteracted = defineComponent();
export const SecondSourceInteractionTriggerEvent = defineComponent();
export const SecondSourceInteractionLeaveEvent = defineComponent();
