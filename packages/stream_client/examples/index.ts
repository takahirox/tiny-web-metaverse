import { Adapter } from "../src/adapter";

const SERVER_URL = 'ws://localhost:3000';
const url = new URL(location.href);

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
  const adapter = await Adapter.connect(SERVER_URL, roomId, peerId);
  await adapter.join();
};

run();
