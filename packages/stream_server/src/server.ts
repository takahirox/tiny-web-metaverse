import express, { Express } from "express";
import http from "http";
import * as mediasoup from "mediasoup";
import * as socketIO from "socket.io";
import {
  LISTEN_IP,
  LISTEN_PORT,
  LOG_LEVEL
} from "./configure";
import { Logger } from "./logger";
import { Room } from "./room";

type SocketInfo = {
  peerId: string;
  roomId: string;
};

export class Server {
  // Bound while a socket is in a room as a peer
  private socketInfos: Map<socketIO.Socket, SocketInfo>;
  private peerIdToSocket: Map<string, socketIO.Socket>;

  private rooms: Map<string, Room>;
  private socketServer: socketIO.Server;
  // TODO: Use https
  private webServer: http.Server;
  private worker: mediasoup.types.Worker;

  static async create(): Promise<Server> {
    Logger.info('Create servers.');

    // WebServer
    const app: Express = express();
    app.use(express.static(__dirname));
    const webServer = http.createServer(app);

    // SocketServer
    const socketServer = new socketIO.Server(webServer, {
      // TODO: Proper configuration
      cors: {
        origin: '*'
      }
    });

    // Mediasoup Worker
    const worker = await mediasoup.createWorker({
      logLevel: LOG_LEVEL
    });

    const server = new Server(webServer, socketServer, worker);

    await server.initWebServer();
    server.initSocketServer();

    return server;
  }

  private constructor(
    webServer: http.Server,
    socketServer: socketIO.Server,
    worker: mediasoup.types.Worker
  ) {
    this.worker = worker;
    this.webServer = webServer;
    this.socketServer = socketServer;

    this.peerIdToSocket = new Map();
    this.socketInfos = new Map();
    this.rooms = new Map();
  }

  close(): void {
    Logger.info('Close servers.');

    // TODO: Implement properly
    this.worker.close();
    this.webServer.close();
    this.socketServer.close();

    for (const room of this.rooms.values()) {
      room.close();
    }
    this.rooms.clear();
  }

  private async initWebServer(): Promise<void> {
    Logger.info('Initialize Web server.');

    const server = this.webServer;

    server.on('error', (error) => {
      // TODO: Proper error handling
      Logger.error(error);
    });

    await new Promise((resolve) => {
      server.listen(LISTEN_PORT, LISTEN_IP, () => {
        Logger.info(`Web server is running at http://${LISTEN_IP}:${LISTEN_PORT}.`);
        resolve(undefined);
      });
    });
  }

  private initSocketServer(): void {
    Logger.info('Initialize Socket server.');

    const rooms = this.rooms;
    const server = this.socketServer;
    const worker = this.worker;

    // TODO: Add types for parameters and callbacks
    server.on('connection', (socket) => {
      Logger.debug(`Socket ${socket.id} is connected.`);

      // Helpers

      // TODO: Avoid any
      const callErrorCallback = (errorback: (arg: any) => void, error: Error): void => {
        Logger.error(error);
        errorback({ error: error.message });
      };

      const socketMustHaveEntered = (errorback: (arg: any) => void): boolean => {
        if (!this.socketInfos.has(socket)) {
          // TODO: Handle properly
          callErrorCallback(errorback, new Error(`Socket ${socket.id} has not entered any Room.`));
          return false;
        }
        return true;
      };

      const socketMustNotHaveEntered = (errorback: (arg: any) => void): boolean => {
        if (this.socketInfos.has(socket)) {
          // TODO: Handle properly
          const { peerId, roomId } = this.socketInfos.get(socket)!;
          callErrorCallback(errorback, new Error(`Socket ${socket.id} has alerady entered Room ${roomId} as Peer ${peerId}.`));
          return false;
        }
        return true;
      };

      const roomMustExist = (roomId: string, errorback: (arg: any) => void): boolean => {
        if (!rooms.has(roomId)) {
          // TODO: Proper error handling
          callErrorCallback(errorback, new Error(`Unknown Room ${roomId}.`));
          return false;
        }
        return true;
      };

      const peerMustBeInRoom = (roomId: string, peerId: string, errorback: (arg: any) => void): boolean => {
        // Room existence must be checked beforehand
        if (!rooms.get(roomId)!.hasPeer(peerId)) {
          callErrorCallback(errorback, new Error(`Peer ${peerId} already exists in Room ${roomId}.`));
          return false;
        }
        return true;
      };

      const peerMustNotBeInRoom = (roomId: string, peerId: string, errorback: (arg: any) => void): boolean => {
        // Room existence must be checked beforehand
        if (rooms.get(roomId)!.hasPeer(peerId)) {
          callErrorCallback(errorback, new Error(`Peer ${peerId} is not in Room ${roomId}.`));
          return false;
        }
        return true;
      };

      const exitRoom = (roomId: string, peerId: string): void => {
        if (rooms.has(roomId)) {
          const room = rooms.get(roomId)!;

          if (room.hasPeer(peerId)) {
            room.exit(peerId);

            if (room.empty()) {
              Logger.debug(`Room ${roomId} became empty then closing it.`);
              room.close();
              rooms.delete(roomId);
            }
          } else {
            // Should not happen
            Logger.error(new Error(`Peer ${peerId} doesn't exist in Room ${roomId}.`));
            return;
          }
        } else {
          // Should not happen
          Logger.error(new Error(`Room ${roomId} doesn't exist`));
          return;
        }

        if (this.socketInfos.has(socket)) {
          this.socketInfos.delete(socket);
          this.peerIdToSocket.delete(peerId);
        } else {
          // Should not happen
          Logger.error(new Error(`SocketInfo is not found ${socket.id}.`));
          return;
        }
      };

      // Event handlers

      socket.on('disconnect', async () => {
        Logger.debug(`Socket disconnect event: ${socket.id}`);

        // TODO: Check whether it is guaranteed that disconnect event
        //       is fired when disconnected.

        // TODO: Proper handling

        Logger.debug(`Socket ${socket.id} is dicsonnected.`);

        if (!this.socketInfos.has(socket)) {
          return;
        }

        const { peerId, roomId } = this.socketInfos.get(socket)!;
        exitRoom(roomId, peerId);
      });

      socket.on('enter', async (data, callback) => {
        Logger.debug(`Socket enter_room event: ${socket.id}`);

        if (!socketMustNotHaveEntered(callback)) {
          return;
        }

        const { peerId, roomId } = data;

        // TODO: Validate input data

        Logger.debug(`Peer ${peerId} attempts to enter Room ${roomId}.`);

        // TODO: Consider to save peerId and roomId to socket.
        //       Clients no longer need to send peerId and roomId
        //       in the following requests.

        if (!rooms.has(roomId)) {
          Logger.debug(`Room ${roomId} is not found then creating it.`);
          rooms.set(roomId, await Room.create(roomId, worker));
        }

        if (!peerMustNotBeInRoom(roomId, peerId, callback)) {
          return;
        }

        rooms.get(roomId)!.enter(peerId);

        this.socketInfos.set(socket, { peerId, roomId });
        this.peerIdToSocket.set(peerId, socket);

        callback(true);
      });

      socket.on('exit', (_data, callback) => {
        Logger.debug(`Socket exitRoom event: ${socket.id}`);

        if (!socketMustHaveEntered(callback)) {
          return;
        }

        const { peerId, roomId } = this.socketInfos.get(socket)!;

        Logger.debug(`Peer ${peerId} attempts to exit Room ${roomId}.`);

        if (!roomMustExist(roomId, callback) || !peerMustBeInRoom(roomId, peerId, callback)) {
          return;
        }

        exitRoom(roomId, peerId);

        callback(true);
      });

      socket.on('getRouterRtpCapabilities', (_data, callback) => {
        Logger.debug(`Socket getRouterRtpCapabilities event: ${socket.id}`);

        if (!socketMustHaveEntered(callback)) {
          return;
        }

        const { peerId, roomId } = this.socketInfos.get(socket)!;

        Logger.debug(`Peer ${peerId} attempts to get routerRtpCapabilities of Room ${roomId}.`);

        if (!roomMustExist(roomId, callback)) {
          return;
        }

        callback(rooms.get(roomId)!.rtpCapabilities);
      });

      socket.on('join', async (data, callback) => {
        Logger.debug(`Socket join event: ${socket.id}`);

        if (!socketMustHaveEntered(callback)) {
          return;
        }

        const { rtpCapabilities } = data;

        // TODO: Validate input data

        const { peerId, roomId } = this.socketInfos.get(socket)!;

        Logger.debug(`Peer ${peerId} attempts to join Room ${roomId}.`);

        if (!roomMustExist(roomId, callback) || !peerMustBeInRoom(roomId, peerId, callback)) {
          return;
        }

        try {
          rooms.get(roomId)!.join(peerId, rtpCapabilities);
        } catch (error) {
          callErrorCallback(callback, error);
          return;
        }

        // TODO: Return with authorized token?
        callback(true);
      });

      socket.on('leave', async (_data, callback) => {
        Logger.debug(`Socket leave event: ${socket.id}`);

        if (!socketMustHaveEntered(callback)) {
          return;
        }

        const { peerId, roomId } = this.socketInfos.get(socket)!;

        Logger.debug(`Peer ${peerId} attempts to leave Room ${roomId}.`);

        if (!roomMustExist(roomId, callback) || !peerMustBeInRoom(roomId, peerId, callback)) {
          return;
        }

        try {
          rooms.get(roomId)!.leave(peerId);
        } catch (error) {
          callErrorCallback(callback, error);
          return;
        }

        callback(true);
      });

      socket.on('createProducerTransport', async (_data, callback) => {
        Logger.debug(`Socket createProduceTransport event: ${socket.id}`);

        if (!socketMustHaveEntered(callback)) {
          return;
        }

        const { peerId, roomId } = this.socketInfos.get(socket)!;

        Logger.debug(`Peer ${peerId} attempts to create transport for producer in Room ${roomId}.`);

        if (!roomMustExist(roomId, callback) || !peerMustBeInRoom(roomId, peerId, callback)) {
          return;
        }

        try {
          callback(await rooms.get(roomId)!.createProducerTransport(peerId));
        } catch (error) {
          callErrorCallback(callback, error);
          return;
        }
      });

      socket.on('createConsumerTransport', async (_data, callback) => {
        Logger.debug(`Socket createConsumerTransport event: ${socket.id}`);

        if (!socketMustHaveEntered(callback)) {
          return;
        }

        const { peerId, roomId } = this.socketInfos.get(socket)!;

        Logger.debug(`Peer ${peerId} attempts to create transport for consumer in Room ${roomId}.`);

        if (!roomMustExist(roomId, callback) || !peerMustBeInRoom(roomId, peerId, callback)) {
          return;
        }

        const room = rooms.get(roomId)!;

        try {
          callback(await room.createConsumerTransport(peerId));
        } catch (error) {
          callErrorCallback(callback, error);
          return;
        }

        // Consume every producers in a room except for mine

        for (const producerPeerId of room.joinnedPeerIds) {
          if (producerPeerId === peerId) {
            continue;
          }

          for (const producerId of room.getPeer(producerPeerId).producerIds) {
            Logger.debug(`Peer ${peerId} attempts to consume Producer ${producerId} of Peer ${producerPeerId}.`);

            room.consume(peerId, producerId).then((params) => {
              if (room.hasPeer(peerId) && room.getPeer(peerId).joined &&
                room.hasPeer(producerPeerId) && room.getPeer(producerPeerId).joined) {

                Logger.debug(`Peer ${peerId} attempts to emit newConsumer to client for Producer ${producerId}.`);

                socket.emit('newConsumer', params);
              } else {
                // TODO: Close the consumer?
              }
            }).catch(Logger.error);
          }
        }
      });

      socket.on('connectProducerTransport', async (data, callback) => {
        Logger.debug(`Socket connectProducerTransport event: ${socket.id}`);

        if (!socketMustHaveEntered(callback)) {
          return;
        }

        const { dtlsParameters } = data;

        // TODO: Validate input data

        const { peerId, roomId } = this.socketInfos.get(socket)!;

        Logger.debug(`Peer ${peerId} attempts to connect Producer transport in Room ${roomId}.`);

        if (!roomMustExist(roomId, callback) || !peerMustBeInRoom(roomId, peerId, callback)) {
          return;
        }

        try {
          await rooms.get(roomId)!.connectProducerTransport(peerId, dtlsParameters);
          callback(true);
        } catch (error) {
          callErrorCallback(callback, error);
        }
      });

      socket.on('connectConsumerTransport', async (data, callback) => {
        Logger.debug(`Socket connectConsumerTransport event: ${socket.id}`);

        if (!socketMustHaveEntered(callback)) {
          return;
        }

        const { dtlsParameters } = data;

        // TODO: Validate input data

        const { peerId, roomId } = this.socketInfos.get(socket)!;

        Logger.debug(`Peer ${peerId} attempts to connect Consumer transport in Room ${roomId}.`);

        if (!roomMustExist(roomId, callback) || !peerMustBeInRoom(roomId, peerId, callback)) {
          return;
        }

        try {
          await rooms.get(roomId)!.connectConsumerTransport(peerId, dtlsParameters);
          callback(true);
        } catch (error) {
          callErrorCallback(callback, error);
        }
      });

      socket.on('produce', async (data, callback) => {
        Logger.debug(`Socket produce event: ${socket.id}`);

        if (!socketMustHaveEntered(callback)) {
          return;
        }

        const { kind, rtpParameters } = data;

        // TODO: Validate input data

        const { peerId, roomId } = this.socketInfos.get(socket)!;

        Logger.debug(`Peer ${peerId} attempts to produce in Room ${roomId}.`);

        if (!roomMustExist(roomId, callback) && !peerMustBeInRoom(roomId, peerId, callback)) {
          return;
        }

        const room = rooms.get(roomId)!;

        let producerId;

        try {
          producerId = await room.produce(peerId, kind, rtpParameters);
          callback({ id: producerId });
        } catch (error) {
          callErrorCallback(callback, error);
          return;
        }

        // Let remote peers consume this producer

        for (const remotePeerId of room.joinnedPeerIds) {
          if (remotePeerId === peerId) {
            continue;
          }

          if (room.getPeer(remotePeerId).consumerTransportId === null) {
            continue;
          }

          Logger.debug(`Peer ${remotePeerId} attempts to consume Producer ${producerId} of Peer ${peerId}.`);

          room.consume(remotePeerId, producerId).then((params) => {
            if (room.hasPeer(remotePeerId) && room.getPeer(remotePeerId).joined &&
              room.hasPeer(peerId) && room.getPeer(peerId).joined) {
              Logger.debug(`Peer ${remotePeerId} attempts to emit newConsumer to client.`);

              this.peerIdToSocket.get(remotePeerId)!.emit('newConsumer', params);
            } else {
              // TODO: Close the consumer?
            }
          }).catch(Logger.error);
        }
      });
    });
  }
}
