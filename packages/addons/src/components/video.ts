import { defineComponent } from "bitecs";
import { NULL_EID } from "@tiny-web-metaverse/client/src";

export const Video = defineComponent();

export class VideoProxy {
  private static instance: VideoProxy = new VideoProxy();
  private eid: number;
  private map: Map<number, HTMLVideoElement>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): VideoProxy {
    VideoProxy.instance.eid = eid;
    return VideoProxy.instance;
  }

  allocate(video: HTMLVideoElement): void {
    this.map.set(this.eid, video);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get video(): HTMLVideoElement {
    return this.map.get(this.eid)!;
  }
}

export const VideoLoader = defineComponent();

export class VideoLoaderProxy {
  private static instance: VideoLoaderProxy = new VideoLoaderProxy();
  private eid: number;
  private map: Map<number, string /* url */>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): VideoLoaderProxy {
    VideoLoaderProxy.instance.eid = eid;
    return VideoLoaderProxy.instance;
  }

  allocate(url: string): void {
    this.map.set(this.eid, url);
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get url(): string {
    return this.map.get(this.eid)!;
  }
}

export const LazyVideoStateUpdate = defineComponent();

export class LazyVideoStateUpdateProxy {
  private static instance: LazyVideoStateUpdateProxy = new LazyVideoStateUpdateProxy();
  private eid: number;
  private map: Map<number, { muted: boolean, paused: boolean, time: number }>;

  private constructor() {
    this.eid = NULL_EID;
    this.map = new Map();
  }

  static get(eid: number): LazyVideoStateUpdateProxy {
    LazyVideoStateUpdateProxy.instance.eid = eid;
    return LazyVideoStateUpdateProxy.instance;
  }

  allocate(muted: boolean, paused: boolean, time: number): void {
    this.map.set(this.eid, { muted, paused, time });
  }

  free(): void {
    this.map.delete(this.eid);
  }

  get muted(): boolean {
    return this.map.get(this.eid)!.muted;
  }

  get paused(): boolean {
    return this.map.get(this.eid)!.paused;
  }

  get time(): number {
    return this.map.get(this.eid)!.time;
  }
}

export const VideoStateUpdated = defineComponent();
export const NetworkedVideo = defineComponent();
