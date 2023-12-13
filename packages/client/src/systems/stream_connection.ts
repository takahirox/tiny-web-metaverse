import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  StreamClient,
  StreamClientProxy,
  StreamConnectRequestor,
  StreamJoinRequestor,
  StreamLeaveRequestor
} from "../components/stream";
import { removeEntityIfNoComponent } from "../utils/bitecs";
import { toGenerator } from "../utils/coroutine";
import { getMyUserId, getRoomId } from "../utils/network";
import { getStreamClientProxy } from "../utils/stream";

const connectRequestQuery = defineQuery([StreamConnectRequestor]);
const connectRequestEnterQuery = enterQuery(connectRequestQuery);
const connectRequestExitQuery = exitQuery(connectRequestQuery);

const joinRequestQuery = defineQuery([StreamJoinRequestor]);
const joinRequestEnterQuery = enterQuery(joinRequestQuery);
const joinRequestExitQuery = exitQuery(joinRequestQuery);

const leaveRequestQuery = defineQuery([StreamLeaveRequestor]);
const leaveRequestEnterQuery = enterQuery(leaveRequestQuery);
const leaveRequestExitQuery = exitQuery(leaveRequestQuery);

const adapterQuery = defineQuery([StreamClient]);

const connectGenerators = new Map<number, Generator>();
const joinGenerators = new Map<number, Generator>();
const leaveGenerators = new Map<number, Generator>();

function* connect(world: IWorld): Generator<void, void> {
  const adapter = getStreamClientProxy(world).adapter;
  const roomId = getRoomId(world);
  const userId = getMyUserId(world);

  // TODO: What if adapter entity or component is removed
  //       before done?
  yield* toGenerator(adapter.connect(roomId, userId));
}

function* join(world: IWorld): Generator<void, void> {
  // Assumes always single adapter entity exists
  const adapter = StreamClientProxy.get(adapterQuery(world)[0]).adapter;

  // TODO: What if adapter entity or component is removed
  //       before done?
  yield* toGenerator(adapter.join());
}

function* leave(world: IWorld): Generator<void, void> {
  // Assumes always single adapter entity exists
  const adapter = StreamClientProxy.get(adapterQuery(world)[0]).adapter;

  // TODO: What if adapter entity or component is removed
  //       before done?
  yield* toGenerator(adapter.leave());
}

export const streamConnectionSystem = (world: IWorld): void => {
  connectRequestExitQuery(world).forEach(eid => {
    connectGenerators.delete(eid); 
  });

  connectRequestEnterQuery(world).forEach(eid => {
    connectGenerators.set(eid, connect(world));
  });

  connectRequestQuery(world).forEach(eid => {
    let done = false;
    try {
      if (connectGenerators.get(eid).next().done === true) {
        done = true;
      }
    } catch (error) {
      done = true;
      // TODO: Proper error handling
      console.error(error);
    }
    if (done) {
      removeComponent(world, StreamConnectRequestor, eid);
      // In general requestor entity doesn't have any other component
      // so remove the entity if no component.
      removeEntityIfNoComponent(world, eid);
    }
  });

  joinRequestExitQuery(world).forEach(eid => {
    joinGenerators.delete(eid);
  });

  joinRequestEnterQuery(world).forEach(eid => {
    joinGenerators.set(eid, join(world));
  });

  joinRequestQuery(world).forEach(eid => {
    let done = false;
    try {
      if (joinGenerators.get(eid).next().done === true) {
        done = true;
      }
    } catch (error) {
      done = true;
      // TODO: Proper error handling
      console.error(error);
    }
    if (done) {
      joinGenerators.delete(eid);
      removeComponent(world, StreamJoinRequestor, eid);
      removeEntityIfNoComponent(world, eid);
    }
  });

  leaveRequestExitQuery(world).forEach(eid => {
    leaveGenerators.delete(eid);
  });

  leaveRequestEnterQuery(world).forEach(eid => {
    leaveGenerators.set(eid, leave(world));
  });

  leaveRequestQuery(world).forEach(eid => {
    let done = false;
    try {
      if (leaveGenerators.get(eid).next().done === true) {
        done = true;
      }
    } catch (error) {
      done = true;
      // TODO: Proper error handling
      console.error(error);
    }
    if (done) {
      leaveGenerators.delete(eid);
      removeComponent(world, StreamLeaveRequestor, eid);
      removeEntityIfNoComponent(world, eid);
    }
  });
};
