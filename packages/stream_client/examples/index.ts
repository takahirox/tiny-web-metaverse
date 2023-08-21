import { StreamAdapter } from "../src/adapter";

const SERVER_URL = 'ws://localhost:3000';
const url = new URL(location.href);

const remotePeers: Record<string, {
  joined: boolean,
  audio: null | HTMLAudioElement
}> = {};

const reloadWithRoomIdIfNeeded = async (): Promise<void> => {
  if (!url.searchParams.has('room_id')) {
    url.searchParams.set('room_id', (Math.random() * 1000).toFixed(0));
    location.href = url.href;
    // Never return
    await new Promise(() => {});
  }
};

const createPeerId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const run = async (): Promise<void> => {
  await reloadWithRoomIdIfNeeded();

  const roomId = url.searchParams.get('room_id');
  const peerId = createPeerId();
  const adapter = new StreamAdapter(SERVER_URL);

  adapter.on('newConsumer', (consumer: { track: MediaStreamTrack, peerId: string }) => {
    const stream = new MediaStream();
    stream.addTrack(consumer.track);

    const audio = document.createElement('audio');
    audio.srcObject = stream;
    audio.autoplay = true;
    audio.controls = true;

    remotePeers[consumer.peerId].audio = audio;

    document.body.appendChild(audio);
  });

  adapter.on('newPeer', (peerInfo) => {
    remotePeers[peerInfo.id] = { joined: false, audio: null };
  });

  adapter.on('joinedPeer', (peerInfo) => {
    remotePeers[peerInfo.id].joined = true;
  });

  adapter.on('leftPeer', (peerInfo) => {
    remotePeers[peerInfo.id].joined = false;
  });

  adapter.on('exitedPeer', (peerInfo) => {
    const audio = remotePeers[peerInfo.id].audio;

    if (audio !== null) {
      document.body.removeChild(audio);
    }

    delete remotePeers[peerInfo.id];
  });

  const peerInfos = await adapter.connect(roomId, peerId);

  for (const peerInfo of peerInfos) {
    remotePeers[peerInfo.id] = { joined: peerInfo.joined, audio: null };
  }

  await adapter.join();

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const track = stream.getAudioTracks()[0];
  await adapter.produce(track);
};

run();
