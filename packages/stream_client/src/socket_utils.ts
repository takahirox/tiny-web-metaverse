import { Socket } from "socket.io-client";

// TODO: Avoid any if possible
export const asyncEmit = (
  socket: Socket,
  eventName: string,
  data: object = {}
): Promise<any> => {
  return new Promise((resolve) => {
    socket.emit(eventName, data, resolve);
  });
};
