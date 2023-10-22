import { defineQuery, IWorld } from "bitecs";
import {
  Time,
  TimeProxy
} from "../components/time";

const timeQuery = defineQuery([Time]);

export const timeSystem = (world: IWorld): void => {
  const timeEids = timeQuery(world);

  if (timeEids.length === 0) {
    return;
  }

  const timestamp = performance.now();

  timeEids.forEach(eid => {
    const proxy = TimeProxy.get(eid);

    if (proxy.timestamp === 0.0) {
      proxy.delta = 0.0;
      proxy.elapsed = 0.0;
    } else {
      proxy.delta = (timestamp - proxy.timestamp) * 0.001;
      proxy.elapsed += proxy.delta;
    }

    proxy.timestamp = timestamp;
  });
};
