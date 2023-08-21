import {
  addComponent,
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  MediaDeviceManager,
  MicConnected,
  MicRequest,
} from "../components/media_device";
import { StreamClient, StreamClientProxy } from "../components/stream";

function* getAudioMedia(world: IWorld): Generator {
  let done = false;
  let error = null;

  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    // TODO: Store the track or stream into a Component and
    //       produce in another system?
    const track = stream.getAudioTracks()[0];
    // Assumes always single adapter entity exists
    const adapter = StreamClientProxy.get(adapterQuery(world)[0]).adapter;
    // TODO: What if not connected?
    return adapter.produce(track);
  }).then(() => {
    done = true;
  }).catch(e => {
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

const micRequestQuery = defineQuery([MediaDeviceManager, MicRequest]);
const micRequestEnterQuery = enterQuery(micRequestQuery);
const micRequestExitQuery = exitQuery(micRequestQuery);
const adapterQuery = defineQuery([StreamClient]);

const generators = new Map<number, Generator>();

export const micRequestSystem = (world: IWorld): void => {
  micRequestExitQuery(world).forEach(eid => {
    generators.delete(eid);
  });

  micRequestEnterQuery(world).forEach(eid => {
    generators.set(eid, getAudioMedia(world));
  });

  micRequestQuery(world).forEach(eid => {
    let done = false;
    try {
      if (generators.get(eid).next().done === true) {
        done = true;
        addComponent(world, MicConnected, eid);
      }
    } catch (error) {
      // TODO: Proper error handling
      console.error(error);
      done = true;
    }
    if (done) {
      generators.delete(eid);
      removeComponent(world, MicRequest, eid);
    }
  });
};
