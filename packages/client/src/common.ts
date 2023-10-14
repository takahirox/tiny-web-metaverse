import { IWorld } from "bitecs";

export const NULL_EID = 0;

//
export const INITIAL_VERSION = 0;
export const LOCAL_VERSION = -1;

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

// TODO: Avoid any
export type Serializer = (world: IWorld, eid: number) => any;
export type Deserializer = (world: IWorld, eid: number, data: any, updatedAt: number) => void;
export type NetworkDeserializer = (world: IWorld, eid: number, data: any, updatedAt: number) => void;
export type DiffChecker = (world: IWorld, eid: number, cache: any, updatedAt: number) => boolean;
export type SerializerFunctions = {
  // TODO: Rename? eg: initialDeserializer
  // TODO: Write comment what this is for
  deserializer: Deserializer,
  diffChecker: DiffChecker,
  // TODO: Write comment what this is for
  networkDeserializer: NetworkDeserializer,
  serializer: Serializer
};

export type System = (world: IWorld) => void;

// TODO: Configurable
export const NETWORK_INTERVAL = 1.0 / 60 * 5;

// TODO: More accurate number
// TODO: Configurable?
export const F32_EPSILON = 0.00001;

// In the second.
// TODO: This is very arbitrary number. Think of better number.
// TODO: Configurable?
export const TIME_EPSILON = 2.0;