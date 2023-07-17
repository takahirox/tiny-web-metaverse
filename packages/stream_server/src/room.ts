import * as mediasoup from "mediasoup";
import { LISTEN_IP, MEDIA_CODECS } from "./configure";
import {
  ConsumerParams,
  getConsumerParams,
  getTransportParams,
  type TransportParams
} from "./message";
import { Peer } from "./peer";

export class Room {
  readonly id: string;
  private router: mediasoup.types.Router;
  private consumers: Map<string, mediasoup.types.Consumer>;
  private consumerTransports: Map<string, mediasoup.types.WebRtcTransport>;
  private peers: Map<string, Peer>;
  private producers: Map<string, mediasoup.types.Producer>;
  private producerTransports: Map<string, mediasoup.types.WebRtcTransport>;

  static async create(id: string, worker: mediasoup.types.Worker): Promise<Room> {
    const router = await worker.createRouter({
      mediaCodecs: MEDIA_CODECS
    });
    return new Room(id, router);
  }

  private constructor(id: string, router: mediasoup.types.Router) {
    this.id = id;
    this.router = router;

    this.consumers = new Map();
    this.consumerTransports = new Map();
    this.peers = new Map();
    this.producers = new Map();
    this.producerTransports = new Map();
  }

  get rtpCapabilities(): mediasoup.types.RtpCapabilities {
    return this.router.rtpCapabilities;
  }

  get peerIds(): string[] {
    const ids = [];
    for (const p of this.peers.values()) {
      ids.push(p.id);
    }
    return ids;    
  }

  get joinnedPeerIds(): string[] {
    const ids = [];
    for (const p of this.peers.values()) {
      if (p.joined) {
        ids.push(p.id);
      }
    }
    return ids;
  }

  close(): void {
    // TODO: Implement
  }

  hasPeer(peerId: string): boolean {
    return this.peers.has(peerId);
  }

  getPeer(peerId: string): Peer {
    return this.peers.get(peerId)!;
  }

  private mustBeInRoom(peerId: string): void {
    if (!this.peers.has(peerId)) {
      throw new Error(`Peer ${peerId} is not found in the Room ${this.id}.`);
    }
  }

  private mustNotBeInRoom(peerId: string): void {
    if (this.peers.has(peerId)) {
      throw new Error(`Peer ${peerId} is already in the Room ${this.id}.`);
    }
  }

  enter(peerId: string): void {
    this.mustNotBeInRoom(peerId);

    this.peers.set(peerId, new Peer(peerId));
  }

  exit(peerId: string): void {
    this.mustBeInRoom(peerId);

    this.peers.get(peerId)!.dispose();
    this.peers.delete(peerId);
  }

  join(peerId: string, rtpCapabilities: mediasoup.types.RtpCapabilities): void {
    this.mustBeInRoom(peerId);

    this.peers.get(peerId)!.join(rtpCapabilities);
  }

  leave(peerId: string): void {
    this.mustBeInRoom(peerId);

    this.peers.get(peerId)!.leave();
    this.peers.delete(peerId);
  }

  empty(): boolean {
    return this.peers.size === 0;
  }

  private async createWebRtcTransport(): Promise<mediasoup.types.WebRtcTransport> {
    return await this.router.createWebRtcTransport({
      listenIps: [LISTEN_IP],
      // TODO: Configurable
      enableUdp: true,
      enableTcp: true,
      preferUdp: true
    });
  }

  async createProducerTransport(peerId: string): Promise<TransportParams> {
    this.mustBeInRoom(peerId);

    const transport = await this.createWebRtcTransport();

    // TODO: What if the peer has already left the room?

    this.producerTransports.set(transport.id, transport);
    this.peers.get(peerId)!.setProducerTransportId(transport.id);
    return getTransportParams(transport);
  }

  async createConsumerTransport(peerId: string): Promise<TransportParams> {
    this.mustBeInRoom(peerId);

    const transport = await this.createWebRtcTransport();

    // TODO: What if the peer has already left the room?

    this.consumerTransports.set(transport.id, transport);
    this.peers.get(peerId)!.setConsumerTransportId(transport.id);
    return getTransportParams(transport);
  }

  async connectProducerTransport(
    peerId: string,
    dtlsParameters: mediasoup.types.DtlsParameters
  ): Promise<void> {
    this.mustBeInRoom(peerId);

    const transportId = this.peers.get(peerId)!.producerTransportId;

    if (transportId === null) {
      throw new Error(`Peer ${peerId} doesn't have producer transport.`);
    }

    if (!this.producerTransports.has(transportId)) {
      throw new Error(`Producer transport ${transportId} of Peer ${peerId} is not found.`);
    }

    await this.producerTransports.get(transportId)!.connect({ dtlsParameters });
  }

  async connectConsumerTransport(
    peerId: string,
    dtlsParameters: mediasoup.types.DtlsParameters
  ): Promise<void> {
    this.mustBeInRoom(peerId);

    const transportId = this.peers.get(peerId)!.consumerTransportId;

    if (transportId === null) {
      throw new Error(`Peer ${peerId} doesn't have consumer transport.`);
    }

    if (!this.consumerTransports.has(transportId)) {
      throw new Error(`Consumer transport ${transportId} of Peer ${peerId} is not found.`);
    }

    await this.consumerTransports.get(transportId)!.connect({ dtlsParameters });
  }

  async produce(
    peerId: string,
    kind: mediasoup.types.MediaKind,
    rtpParameters: mediasoup.types.RtpParameters
  ): Promise<string> {
    this.mustBeInRoom(peerId);

    const peer = this.peers.get(peerId)!;
    const transportId = peer.producerTransportId;

    if (transportId === null) {
      throw new Error(`Peer ${peerId} doesn't have consumer transport yet.`);
    }

    if (!this.producerTransports.has(transportId)) {
      throw new Error(`Producer transport ${transportId} is not found.`);
    }

    const producer = await this.producerTransports.get(transportId)!.produce({
      kind,
      rtpParameters
    });

    // TODO: What if the peer has already left the room?

    this.producers.set(producer.id, producer);
    peer.addProducerId(producer.id);
    return producer.id;
  }

  async consume(
    consumerPeerId: string,
    producerPeerId: string,
    producerId: string
  ): Promise<ConsumerParams> {
    this.mustBeInRoom(consumerPeerId);
    this.mustBeInRoom(producerPeerId);

    if (!this.producers.has(producerId)) {
      throw new Error(`Producer ${producerId} is not found.`);
    }

    const consumerPeer = this.peers.get(consumerPeerId);
    const transportId = consumerPeer.consumerTransportId;

    if (transportId === null) {
      throw new Error(`Consumer peer ${consumerPeerId} doesn't have consumer transport yet.`);
    }

    if (!this.consumerTransports.has(transportId)) {
      throw new Error(`Consumer transport ${transportId} is not found.`);
    }

    const consumer = await this.consumerTransports.get(transportId)!.consume({
      producerId: producerId,
      rtpCapabilities: consumerPeer.rtpCapabilities,
      paused: true
    });

    // TODO: What if the peer, transport, or room is already closed?

    this.consumers.set(consumer.id, consumer);
    consumerPeer.addConsumerId(consumer.id);
    return getConsumerParams(consumerPeerId, producerPeerId, producerId, consumer);
  }

  async resumeConsumer(consumerId: string): Promise<void> {
    if (!this.consumers.has(consumerId)) {
      throw new Error(`Consumer ${consumerId} is not found.`);
    }
    await this.consumers.get(consumerId).resume();
  }
}
