import * as mediasoup from "mediasoup-client";
import * as socketIO from "socket.io-client";
import { Logger } from "./logger";
import { asyncEmit } from "./socket_utils";

// Helper

const throwError = (error: Error): void => {
  Logger.error(error);
  throw error;
};

// TODO: Proper error handling

export class StreamAdapter {
  private device: mediasoup.types.Device;
  private socket: socketIO.Socket;

  private connected: boolean;
  private joined: boolean;

  private recvTransport: null | mediasoup.types.Transport;
  private sendTransport: null | mediasoup.types.Transport;

  private connectedEventListener: null | ((peerInfos: { id: string, joined: boolean }[]) => void);
  private joinedEventListener: null | (() => void);
  private disconnectedEventListener: null | (() => void);
  private newPeerEventListener: null | ((peerInfo: { id: string }) => void);
  private joinedPeerEventListener: null | ((peerInfo: { id: string }) => void);
  private leftPeerEventListener: null | ((peerInfo: { id: string }) => void);
  private exitedPeerEventListener: null | ((peerInfo: { id: string }) => void);
  // TODO: Avoid any
  private newConsumerEventListener: null | ((consumerInfo: any) => void);

  // Holds consumerInfo until recvTransport is ready.
  // TODO: Avoid any
  private consumerInfoQueue: any[];

  constructor(serverUrl: string = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:3000`) {
    Logger.info(`Server URL: ${serverUrl}.`);

    this.socket = socketIO.io(serverUrl, { autoConnect: false });

    this.device = new mediasoup.Device();
    this.connected = false;
    this.joined = false;

    // Created when joinning
    this.sendTransport = null;
    this.recvTransport = null;

    this.connectedEventListener = null;
    this.joinedEventListener = null;
    this.disconnectedEventListener = null;
    this.newPeerEventListener = null;
    this.joinedPeerEventListener = null;
    this.leftPeerEventListener = null;
    this.exitedPeerEventListener = null;
    this.newConsumerEventListener = null;

    this.consumerInfoQueue = [];
  }

  connect(roomId: string, peerId: string): Promise<{ id: string, joined: boolean }[]> {
    Logger.info(`Connect Room ${roomId} as Peer ${peerId}.`);

    if (this.connected) {
      throwError(new Error('Already connected.'));
    }

    const socket = this.socket;
    socket.connect();

    return new Promise((resolve, reject) => {
      socket.on('connect', async () => {
        Logger.debug('Connect event on Socket.');

        let remotePeers;

        try {
          remotePeers = await asyncEmit(socket, 'enter', { roomId, peerId });
        } catch (error) {
          Logger.error(error);
          reject(error);
          return;
        }

        Logger.info(`Succeeded with connecting Room ${roomId} as Peer ${peerId}`);
        Logger.debug(`Remote peers`, remotePeers);

        this.connected = true;

        if (this.connectedEventListener !== null) {
           this.connectedEventListener(remotePeers);
        }

        resolve(remotePeers);
      });

      socket.on('disconnect', async () => {
        Logger.debug('Disconnect event on Socket.');

        // TODO: Proper handling
        Logger.info(`Disconnected from Room ${roomId}.`);

        this.connected = false;

        if (this.disconnectedEventListener !== null) {
           this.disconnectedEventListener();
        }
	  });

      socket.on('newPeer', async (peerInfo) => {
        Logger.debug(`newPeer event on Socket`, peerInfo);

        if (this.newPeerEventListener !== null) {
           this.newPeerEventListener(peerInfo);
        }
      });

      socket.on('joinedPeer', async (peerInfo) => {
        Logger.debug(`joinedPeer event on Socket`, peerInfo);

        if (this.joinedPeerEventListener !== null) {
           this.joinedPeerEventListener(peerInfo);
        }
      });

      socket.on('leftPeer', async (peerInfo) => {
        Logger.debug(`leftPeer event on Socket`, peerInfo);

        if (this.leftPeerEventListener !== null) {
           this.leftPeerEventListener(peerInfo);
        }
      });

      socket.on('exitedPeer', async (peerInfo) => {
        Logger.debug(`exitedPeer event on Socket`, peerInfo);

        if (this.exitedPeerEventListener !== null) {
           this.exitedPeerEventListener(peerInfo);
        }
      });

      socket.on('newConsumer', async (consumerInfo) => {
        Logger.debug('newConsumer event on Socket.', consumerInfo);

        this.consumerInfoQueue.push(consumerInfo);
        this.handleConsumerInfos();
      });
    });
  }

  // TODO: Avoid any if possible
  on(eventName: string, callback: (...args: any[]) => void): void {
    switch (eventName) {
      case 'connected':
        this.connectedEventListener = callback;
        return;
      case 'joined':
        this.joinedEventListener = callback;
        return;
      case 'disconnected':
        this.disconnectedEventListener = callback;
        return;
      case 'newPeer':
        this.newPeerEventListener = callback;
        return;
      case 'joinedPeer':
        this.joinedPeerEventListener = callback;
        return;
      case 'leftPeer':
        this.leftPeerEventListener = callback;
        return;
      case 'exitedPeer':
        this.exitedPeerEventListener = callback;
        return;
      case 'newConsumer':
        this.newConsumerEventListener = callback;
        return;
      default:
        throw new Error(`Unknown event name ${eventName}.`);
    }
  }

  off(eventName: string): void {
    switch (eventName) {
      case 'connected':
        this.connectedEventListener = null;
        return;
      case 'joined':
        this.joinedEventListener = null;
        return;
      case 'disconnected':
        this.disconnectedEventListener = null;
        return;
      case 'newPeer':
        this.newPeerEventListener = null;
        return;
      case 'joinedPeer':
        this.joinedPeerEventListener = null;
        return;
      case 'leftPeer':
        this.leftPeerEventListener = null;
        return;
      case 'exitedPeer':
        this.exitedPeerEventListener = null;
        return;
      case 'newConsumer':
        this.newConsumerEventListener = null;
        return;
      default:
        throw new Error(`Unknown event name ${eventName}.`);
    }
  }

  private handleConsumerInfos(): void {
    if (this.recvTransport === null) {
      return;
    }

    for (const consumerInfo of this.consumerInfoQueue) {
      Logger.debug(`Consume`, consumerInfo);

      this.recvTransport.consume({
        ...consumerInfo,
        codecOptions: {}
      }).then(async (consumer) => {
        Logger.debug(`Consumer created`, consumer);

        // Consumer is paused when created so resume here
        await asyncEmit(this.socket, 'resumeConsumer', {
          consumerId: consumer.id
        });
        await consumer.resume();

        Logger.debug(`Consumer resumed`, consumer);

        if (this.newConsumerEventListener !== null) {
          this.newConsumerEventListener({ track: consumer.track, peerId: consumerInfo.producerPeerId });
        }
      // TODO: Proper error handling
      }).catch(Logger.error);
    }

    this.consumerInfoQueue.length = 0;
  }

  async exit(): Promise<void> {
    Logger.debug(`Attempt to exit from Room.`);

    if (this.connected) {
      throwError(new Error('Not connected.'));
    }

    try {
      await asyncEmit(this.socket, 'exit');
    } catch (error) {
      throwError(error);
    }

    Logger.info(`Succeeded with disconnecting from Room.`);
  }

  async join(): Promise<void> {
    Logger.debug(`Attempt to get routerRtpCapabilities of Room.`);

    if (!this.connected) {
      throwError(new Error('Not connected.'));
    }

    let routerRtpCapabilities;

    try {
      routerRtpCapabilities = await asyncEmit(this.socket, 'getRouterRtpCapabilities');
    } catch (error) {
      throwError(error);
    }

    Logger.debug(`Received routerRtpCapabilities.`, routerRtpCapabilities);

    await this.device.load({ routerRtpCapabilities });

    Logger.debug(`Attempt to join Room.`);

    try {
      await asyncEmit(this.socket, 'join', {
        rtpCapabilities: routerRtpCapabilities
      });
    } catch (error) {
      throwError(error);
    }

    Logger.debug(`Succeeded with joining Room.`);

    this.joined = true;

    // TODO: Leave room if failed to create transports?

    const pending = [];

    pending.push(this.createSendTransport().then((transport) => {
      this.sendTransport = transport;
    }));

    pending.push(this.createRecvTransport().then((transport) => {
      this.recvTransport = transport;
      //
      this.handleConsumerInfos();
    }));

    await Promise.all(pending);

    if (this.joinedEventListener !== null) {
      this.joinedEventListener();
    }
  }

  async leave(): Promise<void> {
    Logger.debug(`Attempt to leave Room.`);

    if (!this.connected) {
      throwError(new Error('Not connected.'));
    }

    if (!this.joined) {
      throwError(new Error(`Not joined Room.`));
    }

    if (this.sendTransport) {
      this.sendTransport.close();
      this.sendTransport = null;
    }

    if (this.recvTransport) {
      this.recvTransport.close();
      this.recvTransport = null;
    }

    try {
      await asyncEmit(this.socket, 'leave');
    } catch (error) {
      throwError(error);
    }
  }

  private async createSendTransport(): Promise<mediasoup.types.Transport> {
    Logger.debug(`Attempt to create Send Transport.`);

    let transportInfo;

    try {
      transportInfo = await asyncEmit(this.socket, 'createProducerTransport');
    } catch (error) {
      throwError(error);
    }

    Logger.debug(`Received Send TransportInfo.`, transportInfo);

    const transport = this.device.createSendTransport(transportInfo);

    Logger.debug(`Created Send Transport`, transport);

    transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
      Logger.debug(`Connect event on Send Transport.`, dtlsParameters);

      try {
        await asyncEmit(this.socket, 'connectProducerTransport', { dtlsParameters });
        callback();
      } catch (error) {
        Logger.error(error);
        errback(error);
      }
    });

    transport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
      Logger.debug(`Produce event on Send Transport.`, rtpParameters);

      try {
        const { id } = await asyncEmit(this.socket, 'produce', {
          kind,
          rtpParameters
        });
        callback({ id });
      } catch (error) {
        Logger.error(error);
        errback(error);
      }
    });

    return transport;
  }

  private async createRecvTransport(): Promise<mediasoup.types.Transport> {
    Logger.debug(`Attempt to create Recv Transport.`);

    let transportInfo;

    try {
      transportInfo = await asyncEmit(this.socket, 'createConsumerTransport');
    } catch (error) {
      throwError(error);
    }

    Logger.debug(`Received Recv TransportInfo.`, transportInfo);

    const transport = this.device.createRecvTransport(transportInfo);

    Logger.debug(`Created Recv Transport`, transport);

    transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
      Logger.debug(`Connect event on Recv Transport.`, dtlsParameters);

      try {
        await asyncEmit(this.socket, 'connectConsumerTransport', { dtlsParameters });
        callback();
      } catch (error) {
        Logger.error(error);
        errback(error);
      }
    });

    transport.on('connectionstatechange', async (state) => {
      Logger.debug(`ConnectionStateChange event on Recv Transport.`, state);

      // TODO: Implement
    });

    return transport;
  }

  async produce(track: MediaStreamTrack): Promise<void> {
    Logger.debug(`Attempt to produce.`, track);

    if (!this.connected) {
      throwError(new Error('Not connected.'));
    }

    if (!this.joined) {
      throwError(new Error(`Not joined Room.`));
    }

    if (this.sendTransport === null) {
      throwError(new Error('Send Transport is not initialized yet.'));
    }

    const producer = await this.sendTransport.produce({ track });

    Logger.debug(`Received ProducerInfo`, producer);
  }
}
