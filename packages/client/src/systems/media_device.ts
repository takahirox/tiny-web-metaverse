import {
  addComponent,
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  MicConnectedEvent,
  MicConnectedEventListener,
  MicRequestor,
} from "../components/media_device";
import { StreamClient, StreamClientProxy } from "../components/stream";
import { removeEntityIfNoComponent } from "../utils/bitecs";
import { toGenerator } from "../utils/coroutine";

function* connectUserAudioMedia(world: IWorld): Generator {
  const stream = yield* toGenerator(navigator.mediaDevices.getUserMedia({ audio: true }));
  const track = stream.getAudioTracks()[0];
  // Assumes always single adapter entity exists
  const adapter = StreamClientProxy.get(adapterQuery(world)[0]).adapter;
  // TODO: What if adapter is not connected?
  yield* toGenerator(adapter.produce(track));

  connectedEventListener(world).forEach(listenerEid => {
    addComponent(world, MicConnectedEvent, listenerEid);		
  });
}

const micRequestQuery = defineQuery([MicRequestor]);
const micRequestEnterQuery = enterQuery(micRequestQuery);
const micRequestExitQuery = exitQuery(micRequestQuery);

const adapterQuery = defineQuery([StreamClient]);
const eventQuery = defineQuery([MicConnectedEvent]);
const connectedEventListener = defineQuery([MicConnectedEventListener]);

const generators = new Map<number, Generator>();

export const micRequestSystem = (world: IWorld): void => {
  micRequestExitQuery(world).forEach(eid => {
    generators.delete(eid);
  });

  micRequestEnterQuery(world).forEach(eid => {
    generators.set(eid, connectUserAudioMedia(world));
  });

  micRequestQuery(world).forEach(eid => {
    let done = false;
    try {
      if (generators.get(eid).next().done === true) {
        done = true;
      }
    } catch (error) {
      // TODO: Proper error handling
      console.error(error);
      done = true;
    }
    if (done) {
      generators.delete(eid);
      removeComponent(world, MicRequestor, eid);
      removeEntityIfNoComponent(world, eid);
    }
  });
};

export const micEventClearSystem = (world: IWorld): void => {
  eventQuery(world).forEach(eid => {
    removeComponent(world, MicConnectedEvent, eid); 
  });
};
