import {
  defineQuery,
  IWorld
} from "bitecs";
import {
  StreamEvent,
  StreamEventProxy,
  StreamMessageType,
  StreamRemotePeerRegister,
  StreamRemotePeers,
  StreamRemotePeersProxy
} from "../components/stream";

const registerQuery = defineQuery([StreamRemotePeerRegister, StreamEvent]);
const peersQuery = defineQuery([StreamRemotePeers]);

// TODO: Just store stream here, and process it somewhere else
//       like connecting and processing WebAudio?

const connectAudio = (track: MediaStreamTrack): HTMLAudioElement => {
  const stream = new MediaStream();
  stream.addTrack(track);

  const audio = document.createElement('audio');
  audio.srcObject = stream;
  audio.autoplay = true;

  document.body.appendChild(audio);

  return audio;
};

const disconnectAudio = (audio: HTMLAudioElement): void => {
  audio.pause();
  document.body.removeChild(audio);
};

export const streamRemotePeerRegisterSystem = (world: IWorld): void => {
  registerQuery(world).forEach(eid => {
    // TODO: What if messages arrive out of order?
    for (const event of StreamEventProxy.get(eid).events) {
      // Checks error more than other systems because network stuff is
      // error prone.
      switch (event.type) {
        case StreamMessageType.Connected:
          peersQuery(world).forEach(eid => {
            const peers = StreamRemotePeersProxy.get(eid).peers;
            for (const info of event.data) {
              if (!peers.has(info.id)) {
                peers.set(info.id, info);
              } else {
                // TODO: Proper error handling
                console.error(`Connected: Peer ${info.id} has been already registered.`);
              }
            }
          });
          break;
        case StreamMessageType.NewPeer:
          peersQuery(world).forEach(eid => {
            const peers = StreamRemotePeersProxy.get(eid).peers;
            const id = event.data.id;
            if (!peers.has(id)) {
              peers.set(id, { id, joined: false });
            } else {
              // TODO: Proper error handling
              console.error(`NewPeer: Peer ${id} has been already registered.`);
            }
          });
          break;
        case StreamMessageType.JoinedPeer:
          peersQuery(world).forEach(eid => {
            const peers = StreamRemotePeersProxy.get(eid).peers;
            const id = event.data.id;
            if (peers.has(id)) {
              if (!peers.get(id).joined) {
                peers.get(id).joined = true;
              } else {
                console.error(`JoinedPeer: Peer ${id} has already been joined.`);
              }
            } else {
              console.error(`JoinedPeer: Unknown peer id: ${id}.`);
            }
          });
          break;
        case StreamMessageType.LeftPeer:
          peersQuery(world).forEach(eid => {
            const peers = StreamRemotePeersProxy.get(eid).peers;
            const id = event.data.id;
            if (peers.has(id)) {
              const info = peers.get(id);
              if (info.joined) {
                info.joined = false;
                const audio = info.audio;
                if (audio !== undefined) {
                  disconnectAudio(audio);
                  delete info.audio;
                }
              } else {
                console.error(`LeftPeer: Peer ${id} has not already been joined.`);
              }
            } else {
              console.error(`LeftPeer: Unknown peer id: ${id}.`);
            }
          });
          break;
        case StreamMessageType.ExitedPeer:
          peersQuery(world).forEach(eid => {
            const peers = StreamRemotePeersProxy.get(eid).peers;
            const id = event.data.id;
            if (peers.has(id)) {
              const audio = peers.get(id).audio;
              if (audio !== undefined) {
                disconnectAudio(audio);
              }
              peers.delete(id);
            } else {
              console.error(`ExitedPeer: Unknown peer id: ${id}.`);
            }
          });
          break;
        // TODO: Consuming should be in another system?
        case StreamMessageType.NewConsumer:
          peersQuery(world).forEach(eid => {
            const peers = StreamRemotePeersProxy.get(eid).peers;
            const consumer = event.data;
            const id = consumer.peerId;

            if (!peers.has(id)) {
              console.error(`NewConsumer: Unknown Peer id: ${id}.`);
              return;
            }

            const info = peers.get(id)!;

            if (!info.joined) {
              console.error(`NewConsumer: Peer ${id} has not been already joined.`);
              return;
            }

            if (info.audio !== undefined) {
              console.error(`NewConsumer: Audio of Peer ${id} has been already consumed.`);
              return;
            }

            const audio = connectAudio(consumer.track);
            info.audio = audio;
          });
          break;
      }
    }
  });
};
