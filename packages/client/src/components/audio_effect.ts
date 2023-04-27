import { defineComponent } from "bitecs";
import { NULL_EID } from "../common";

export const AudioContextComponent = defineComponent();
export const AudioContextSuspended = defineComponent();
export const AudioContextResuming = defineComponent();

export class AudioContextProxy {
  private static instance: AudioContextProxy = new AudioContextProxy();
  private eid: number;
  private map: Map<number, AudioContext>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): AudioContextProxy {
    AudioContextProxy.instance.eid = eid;
    return AudioContextProxy.instance;
  }

  allocate(context: AudioContext): void {
    this.map.set(this.eid, context);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get context(): AudioContext {
    return this.map.get(this.eid)!;
  }	
}

export const AudioSource = defineComponent();

type AudioSourceNode = MediaStreamAudioSourceNode | MediaElementAudioSourceNode;

export class AudioSourceProxy {
  private static instance: AudioSourceProxy = new AudioSourceProxy();
  private eid: number;
  private map: Map<number, {
    gain: GainNode,
    panner: PannerNode,
    source: AudioSourceNode,
  }>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): AudioSourceProxy {
    AudioSourceProxy.instance.eid = eid;
    return AudioSourceProxy.instance;
  }

  allocate(source: AudioSourceNode, gain: GainNode, panner: PannerNode): void {
    this.map.set(this.eid, { gain, panner, source });
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get gain(): GainNode {
    return this.map.get(this.eid)!.gain;
  }

  get source(): AudioSourceNode {
    return this.map.get(this.eid)!.source;
  }

  get panner(): PannerNode {
    return this.map.get(this.eid)!.panner;
  }
}

export const AudioDestination = defineComponent();
