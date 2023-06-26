import { defineComponent, Types } from "bitecs";

export const LinearTranslate = defineComponent({
  duration: Types.f32,
  targetX: Types.f32,
  targetY: Types.f32,
  targetZ: Types.f32
});
export const LinearRotate = defineComponent({
  duration: Types.f32,
  targetX: Types.f32,
  targetY: Types.f32,
  targetZ: Types.f32,
  targetW: Types.f32
});
export const LinearScale = defineComponent({
  duration: Types.f32,
  targetX: Types.f32,
  targetY: Types.f32,
  targetZ: Types.f32
});
