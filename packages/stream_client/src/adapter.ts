import * as mediasoup from "mediasoup-client";
import * as socketIO from "socket.io-client";
import { asyncEmit } from "./socket_utils";

export class Adapter {
  private device: mediasoup.types.Device;
  private socket: socketIO.Socket;
  private peerId: string;
  private roomId: string;
  private recvTransport: null | mediasoup.types.Transport;
  private sendTransport: null | mediasoup.types.Transport;

  static async connect(
    serverUrl: string,
    roomId: string,
    peerId: string
  ): Promise<Adapter> {
    console.log(`Room: ${roomId}, Peer: ${peerId}.`);

    return new Promise((resolve, reject) => {
      const socket = socketIO.io(serverUrl);

      socket.on('connect', async () => {
        const success = await asyncEmit(socket, 'enter', {
          peerId: peerId,
          roomId: roomId
        });

        if (!success) {
          // TODO: Proper error handling
          reject(new Error('Failed to connect Room.'));
          return;
        }

        console.log('Succeeded with connecting Room');

        resolve(new Adapter(socket, new mediasoup.Device(), roomId, peerId));
      });

      socket.on('disconnect', async () => {
        // TODO: Proper handling
        console.log('Disconnected from Room.');
	  });
    });
  }

  private constructor(
    socket: socketIO.Socket,
    device: mediasoup.types.Device,
    roomId: string,
    peerId: string
  ) {
    this.socket = socket;
    this.device = device;
    this.roomId = roomId;
    this.peerId = peerId;

    // Created when joinning
    this.sendTransport = null;
    this.recvTransport = null;
  }

  async disconnect(): Promise<void> {
    const success = await asyncEmit(this.socket, 'disconnect_room', {
      peerId: this.peerId,
      roomId: this.roomId
    });

    if (!success) {
      // TODO: Proper error handling
      throw new Error('Failed to disconnect from Room.');
    }

    console.log('Succeeded with disconnecting from Room.');
  }

  async join(): Promise<void> {
    const routerRtpCapabilities = await asyncEmit(this.socket, 'getRouterRtpCapabilities', {
      roomId: this.roomId
    });
    console.log(routerRtpCapabilities);

    await this.device.load({ routerRtpCapabilities });

    const success = await asyncEmit(this.socket, 'join', {
      peerId: this.peerId,
      roomId: this.roomId,
      rtpCapabilities: routerRtpCapabilities
    });

    if (!success) {
      throw new Error('Failed to join Room.');
    }

    console.log('Succeeded with joining Room');

    this.sendTransport = await this.createSendTransport();
    this.recvTransport = await this.createRecvTransport();
  }

  leave(): void {
    if (this.sendTransport) {
      this.sendTransport.close();
      this.sendTransport = null;
    }
    if (this.recvTransport) {
      this.recvTransport.close();
      this.recvTransport = null;
    }
  }

  private async createSendTransport(): Promise<mediasoup.types.Transport> {
    console.log('create sentTransport');

    const transportInfo = await asyncEmit(this.socket, 'createProducerTransport');

    console.log(transportInfo);

    const transport = this.device.createSendTransport(transportInfo);

    console.log(transport);

    transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
      console.log('Send transport connect');

      try {
        await asyncEmit(this.socket, 'connectProducerTransport', {
          transportId: transport.id,
          dtlsParameters
        });
        console.log('Send connectWebRtcTransport.');
        callback();
      } catch (error) {
        // TODO: Proper error handling
        console.error(error);
        errback(error);
      }
    });

    transport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
      console.log('Send transport produce');

      try {
        const { id } = await asyncEmit(this.socket, 'produce', {
          transportId: transport.id,
          kind,
          rtpParameters
        });

        callback({ id });
      } catch (error) {
        // TODO: Proper error handling
        console.error(error);
        errback(error);
      }
    });

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const track = stream.getAudioTracks()[0];
    const producer = await transport.produce({ track });

    console.log(producer);

    return transport;
  }

  private async createRecvTransport(): Promise<mediasoup.types.Transport> {
    console.log('create recvTransport');

    const transportInfo = await asyncEmit(this.socket, 'createConsumerTransport', {
      peerId: this.peerId,
      roomId: this.roomId
    });

    console.log(transportInfo);

    const transport = this.device.createRecvTransport(transportInfo);

    console.log(transport);

    transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
      console.log('Recv transport connect');

      try {
        await asyncEmit(this.socket, 'connectConsumerTransport', {
          transportId: transport.id,
          dtlsParameters
        });
        console.log('Recv connectWebRtcTransport.');
        callback();
      } catch (error) {
        // TODO: Proper error handling
        console.error(error);
        errback(error);
      }
    });

    this.socket.on('newConsumer', async (params) => {
      const consumer = await transport.consume({
        ...params,
        codecOptions: {}
      });
      const stream = new MediaStream();
      stream.addTrack(consumer.track);

      transport.on('connectionstatechange', async (state) => {
        console.log(state);
        switch (state) {
          case 'connected':
            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            video.controls = true;
            video.playsInline = true;
            //await socketRequest(socket, 'resume');
            document.body.appendChild(video);
            break;
        }
      });
    });

    return transport;
  }
/*
  private async produce(): Promise<void> {

  }
*/
}
