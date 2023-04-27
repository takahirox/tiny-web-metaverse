import { defineQuery, IWorld } from "bitecs";
import { StreamClient, StreamClientProxy } from "../components/stream";

const adapterQuery = defineQuery([StreamClient]);

export const getStreamClientProxy = (world: IWorld): StreamClientProxy => {
  // Assumes always single stream client entity exists
  return StreamClientProxy.get(adapterQuery(world)[0]);
};
