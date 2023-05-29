import { IWorld } from "bitecs";

export const NULL_EID = 0;

export const SystemOrder = Object.freeze({
  Time: 0,
  EventHandling: 100,
  Setup: 200,
  BeforeMatricesUpdate: 300,
  MatricesUpdate: 400,
  BeforeRender: 500,
  Render: 600,
  AfterRender: 700,
  PostProcess: 800,
  TearDown: 900
});

// TODO: Avoid object
export type Prefab = (world: IWorld, params: object) => number;
export type PrefabMap = Map<string, Prefab>;

// Ugh... Is passing prefabs good design?
export type System = (world: IWorld, prefabs: Map<string, Prefab>) => void;
