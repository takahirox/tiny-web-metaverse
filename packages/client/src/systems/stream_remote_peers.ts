import {
  defineQuery,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import { NULL_EID } from "../common";
import { AudioSource } from "../components/audio_effect";
import { Avatar } from "../components/avatar";
import {
  Networked,
  NetworkedProxy,
  Remote
} from "../components/network";
import {
  StreamEvent,
  StreamEventProxy,
  StreamMessageType,
  StreamRemotePeerRegister,
  StreamRemotePeers,
  StreamRemotePeersProxy
} from "../components/stream";
import { addAudioSourceWithStream } from "../utils/audio_effect";

const registerQuery = defineQuery([StreamRemotePeerRegister, StreamEvent]);
const peersQuery = defineQuery([StreamRemotePeers]);
const remoteAvatarQuery = defineQuery([Avatar, Remote, Networked]);

// TODO: Just store stream here, and process it somewhere else
//       like connecting and processing WebAudio?

// Any more robust way to find?
const findRemoteAvatar = (world: IWorld, userId: string): number => {
  // Assumes up to one target eid
  const eid = remoteAvatarQuery(world).find(eid => {
    return NetworkedProxy.get(eid).creator === userId;
  }) || NULL_EID;

  if (eid === NULL_EID) {
    console.error(`No Remote avatar corresponding to user id ${userId} is found.`);
  }

  return eid;
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
                const remoteAvatarEid = findRemoteAvatar(world, id);
                if (remoteAvatarEid !== NULL_EID) {
                  // TODO: What if this event happens after remote avatar is removed?
                  removeComponent(world, AudioSource, remoteAvatarEid);
                }
                info.joined = false;
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
              const remoteAvatarEid = findRemoteAvatar(world, id);
              if (remoteAvatarEid !== NULL_EID) {
                // TODO: What if this event happens after remote avatar is removed?
                removeComponent(world, AudioSource, remoteAvatarEid);
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

            const remoteAvatarEid = findRemoteAvatar(world, id);

            if (remoteAvatarEid === NULL_EID) {
              // TODO: What if this event happens before remote avatar is created?
              return;
            }

            if (hasComponent(world, AudioSource, remoteAvatarEid)) {
              console.error(`Remote user ${id} avatar already has audio stream.`);
              return;
            }

            const stream = new MediaStream([consumer.track]);

            // This hack seems to be needed for WebRTC remote stream on Chrome,
            // otherwise no audio comes out.
            let audio = new Audio();
            audio.muted = true;
            audio.srcObject = stream;
            audio.addEventListener('canplaythrough', () => {
              audio = null;
            });

            addAudioSourceWithStream(world, remoteAvatarEid, stream);
          });
          break;
      }
    }
  });
};
