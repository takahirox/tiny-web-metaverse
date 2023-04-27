import { defineQuery, IWorld } from "bitecs";
import { Timestamp, TimestampProxy } from "../components/timestamp";

const timestampQuery = defineQuery([Timestamp]);

export const getTimestampProxy = (world: IWorld): TimestampProxy => {
  // Assumes always single timestamp entity exists
  return TimestampProxy.get(timestampQuery(world)[0]);
};
