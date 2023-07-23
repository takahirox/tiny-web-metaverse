import { Adapter, MessageType } from "../src/index";

const SERVER_URL = 'ws://localhost:4000/socket';

const createPeerId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const adapter = new Adapter({
  url: SERVER_URL,
  userId: createPeerId()
});

adapter.addEventListener(MessageType.UserJoined, (payload) => {
  console.log(payload);	
});
