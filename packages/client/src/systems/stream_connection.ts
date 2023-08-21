import {
  addComponent,
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld,
  removeComponent
} from "bitecs";
import { RoomId, RoomIdProxy } from "../components/room_id";
import {
  StreamClient,
  StreamClientProxy,
  StreamConnecting,
  StreamConnectRequest,
  StreamInLobby,
  StreamInRoom,
  StreamJoining,
  StreamJoinRequest,
  StreamNotConnected,
  StreamLeaveRequest,
  StreamLeaving
} from "../components/stream";
import { UserId, UserIdProxy } from "../components/user_id";

const connectRequestQuery = defineQuery([StreamClient, StreamConnectRequest]);
const connectRequestEnterQuery = enterQuery(connectRequestQuery);
const connectRequestExitQuery = exitQuery(connectRequestQuery);

const joinRequestQuery = defineQuery([StreamClient, StreamJoinRequest]);
const joinRequestEnterQuery = enterQuery(joinRequestQuery);
const joinRequestExitQuery = exitQuery(joinRequestQuery);

const leaveRequestQuery = defineQuery([StreamClient, StreamLeaveRequest]);
const leaveRequestEnterQuery = enterQuery(leaveRequestQuery);
const leaveRequestExitQuery = exitQuery(leaveRequestQuery);

const adapterQuery = defineQuery([StreamClient]);
const roomIdQuery = defineQuery([RoomId]);
const userIdQuery = defineQuery([UserId]);

const connectGenerators = new Map<number, Generator>();
const joinGenerators = new Map<number, Generator>();
const leaveGenerators = new Map<number, Generator>();

function* connect(world: IWorld): Generator<void, void, void> {
  // Assumes always single adapter, roomId, userId entities exist
  const adapter = StreamClientProxy.get(adapterQuery(world)[0]).adapter;
  const roomId = RoomIdProxy.get(roomIdQuery(world)[0]).roomId;
  const userId = UserIdProxy.get(userIdQuery(world)[0]).userId;

  let done = false;
  let error = null;

  // TODO: What if adapter entity or component is removed
  //       before done?

  adapter.connect(roomId, userId).then(() => {
    done = true;  
  }).catch((e: Error) => {
    done = true;
    error = e;
  });

  while (!done) {
    yield;
  }

  if (error !== null) {
    throw error;
  }
}

function* join(world: IWorld): Generator<void, void, void> {
  // Assumes always single adapter entity exists
  const adapter = StreamClientProxy.get(adapterQuery(world)[0]).adapter;

  let done = false;
  let error = null;

  // TODO: What if adapter entity or component is removed
  //       before done?

  adapter.join().then(() => {
    done = true;  
  }).catch((e: Error) => {
    done = true;
    error = e;
  });

  while (!done) {
    yield;
  }

  if (error !== null) {
    throw error;
  }
}

function* leave(world: IWorld): Generator<void, void, void> {
  // Assumes always single adapter entity exists
  const adapter = StreamClientProxy.get(adapterQuery(world)[0]).adapter;

  let done = false;
  let error = null;

  // TODO: What if adapter entity or component is removed
  //       before done?

  adapter.leave().then(() => {
    done = true;  
  }).catch((e: Error) => {
    done = true;
    error = e;
  });

  while (!done) {
    yield;
  }

  if (error !== null) {
    throw error;
  }
}

export const streamConnectionSystem = (world: IWorld): void => {
  connectRequestExitQuery(world).forEach(eid => {
    connectGenerators.delete(eid); 
  });

  connectRequestEnterQuery(world).forEach(eid => {
    connectGenerators.set(eid, connect(world));
    addComponent(world, StreamConnecting, eid);
  });

  connectRequestQuery(world).forEach(eid => {
    let done = false;
    try {
      if (connectGenerators.get(eid).next().done === true) {
        done = true;
        removeComponent(world, StreamNotConnected, eid);
        addComponent(world, StreamInLobby, eid);
      }
    } catch (error) {
      done = true;
      // TODO: Proper error handling
      console.error(error);
    }
    if (done) {
      connectGenerators.delete(eid);
      removeComponent(world, StreamConnectRequest, eid);
      removeComponent(world, StreamConnecting, eid);
    }
  });

  joinRequestExitQuery(world).forEach(eid => {
    joinGenerators.delete(eid);
  });

  joinRequestEnterQuery(world).forEach(eid => {
    joinGenerators.set(eid, join(world));
    addComponent(world, StreamJoining, eid);
  });

  joinRequestQuery(world).forEach(eid => {
    let done = false;
    try {
      if (joinGenerators.get(eid).next().done === true) {
        done = true;
        addComponent(world, StreamInRoom, eid);
        removeComponent(world, StreamInLobby, eid);
      }
    } catch (error) {
      done = true;
      // TODO: Proper error handling
      console.error(error);
    }
    if (done) {
      joinGenerators.delete(eid);
      removeComponent(world, StreamJoinRequest, eid);
      removeComponent(world, StreamJoining, eid);
    }
  });

  leaveRequestExitQuery(world).forEach(eid => {
    leaveGenerators.delete(eid);
  });

  leaveRequestEnterQuery(world).forEach(eid => {
    leaveGenerators.set(eid, leave(world));
    addComponent(world, StreamLeaving, eid);
  });

  leaveRequestQuery(world).forEach(eid => {
    let done = false;
    try {
      if (leaveGenerators.get(eid).next().done === true) {
        done = true;
        addComponent(world, StreamInLobby, eid);
        removeComponent(world, StreamInRoom, eid);
      }
    } catch (error) {
      done = true;
      // TODO: Proper error handling
      console.error(error);
    }
    if (done) {
      leaveGenerators.delete(eid);
      removeComponent(world, StreamLeaveRequest, eid);
      removeComponent(world, StreamLeaving, eid);
    }
  });
};
