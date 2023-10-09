import { defineComponent } from "bitecs";

// Assumes
//   First source: Mouse left click
//   Second source: Mouse right click
// TODO: Rename

export const FirstSourceInteractable = defineComponent();
export const FirstSourceInteractionTriggerEvent = defineComponent();
export const FirstSourceInteracted = defineComponent();

export const SecondSourceInteractable = defineComponent();
export const SecondSourceInteractionTriggerEvent = defineComponent();
export const SecondSourceInteracted = defineComponent();
