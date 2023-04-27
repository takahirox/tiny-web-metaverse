import * as mediasoup from "mediasoup";

export class Peer {
  readonly id: string;
  private _rtpCapabilities: null | mediasoup.types.RtpCapabilities;
  private _joined: boolean;
  private _consumerTransportId: null | string;
  private _producerTransportId: null | string;
  private _consumerIds: Set<string>;
  private _producerIds: Set<string>;

  constructor(id: string) {
    this.id = id;

    this._rtpCapabilities = null;
    this._joined = false;
    this._consumerIds = new Set();
    this._consumerTransportId = null;
    this._producerIds = new Set();
    this._producerTransportId = null;
  }

  get joined(): boolean {
    return this._joined;
  }

  get producerTransportId(): string | null {
    return this._producerTransportId!;
  }

  get consumerTransportId(): string | null {
    return this._consumerTransportId!;
  }

  // This getter must be called after join
  get rtpCapabilities(): mediasoup.types.RtpCapabilities {
    return this._rtpCapabilities!;
  }

  get producerIds(): string[] {
    const ids = [];
    for (const id of this._producerIds.values()) {
      ids.push(id);
    }
    return ids;
  }

  get consumerIds(): string[] {
    const ids = [];
    for (const id of this._consumerIds.values()) {
      ids.push(id);
    }
    return ids;
  }

  join(rtpCapabilities: mediasoup.types.RtpCapabilities): void {
    if (this.joined === true) {
      throw new Error(`Peer ${this.id} has already joined.`);
    }
    this._joined = true;
    this._rtpCapabilities = rtpCapabilities;
  }

  leave(): void {
    if (this.joined === false) {
      throw new Error(`Peer ${this.id} has not joined.`);
    }
    this._joined = false;
    this._rtpCapabilities = null;
  }

  dispose(): void {
    // TODO: Implement
  }

  setConsumerTransportId(id: string): void {
    if (id !== null && this.consumerTransportId !== null) {
      throw new Error(`Consumer transport is already set.`);
    } else if (id === null && this.consumerTransportId === null) {
      throw new Error(`Consumer transport is already unset.`);
    }
    this._consumerTransportId = id;
  }

  setProducerTransportId(id: string): void {
    if (id !== null && this.producerTransportId !== null) {
      throw new Error(`Producer transport is already set.`);
    } else if (id === null && this.producerTransportId === null) {
      throw new Error(`Producer transport is already unset.`);
    }
    this._producerTransportId = id;
  }

  addConsumerId(id: string): void {
    if (this._consumerIds.has(id)) {
      throw new Error(`Consumer ${id} is already registered.`);
    }
    this._consumerIds.add(id);
  }

  clearConsumerIds(): void {
    this._consumerIds.clear();
  }

  addProducerId(id: string): void {
    if (this._producerIds.has(id)) {
      throw new Error(`Producer ${id} is already registered.`);
    }
    this._producerIds.add(id);
  }

  clearProducerIds(): void {
    this._producerIds.clear(); 
  }
}
