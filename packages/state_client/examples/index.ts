import { Adapter } from "../src/adapter";

const SERVER_URL = 'ws://localhost:4000/socket';

const createPeerId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const adapter = new Adapter({
  url: SERVER_URL,
  userId: createPeerId()
});

adapter.addEventListener('user_joined', (payload) => {
  console.log(payload);	
});
