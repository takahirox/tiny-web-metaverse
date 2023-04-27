import { defineComponent, Types } from "bitecs";

export const Raycastable = defineComponent();
export const Raycasted = defineComponent({
  distance: Types.f32
});
export const RaycastedByFirstRay = defineComponent();
export const RaycastedBySecondRay = defineComponent();

export const RaycastedNearest = defineComponent();
export const RaycastedNearestByFirstRay = defineComponent();
export const RaycastedNearestBySecondRay = defineComponent();
