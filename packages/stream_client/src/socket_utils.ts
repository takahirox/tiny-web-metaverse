import { Socket } from "socket.io-client";

const TIMEOUT = 5000;

// TODO: Avoid any if possible
export const asyncEmit = async (
  socket: Socket,
  eventName: string,
  data: object = {}
): Promise<any> => {
  const response = await socket.timeout(TIMEOUT).emitWithAck(eventName, data);
  if (response && response.error) {
    throw new Error(response.error);
  }
  return response;
};
