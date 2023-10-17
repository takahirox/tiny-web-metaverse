import { addComponent, defineQuery, IWorld } from "bitecs";
import {
  AudioContextComponent,
  AudioContextProxy,
  AudioSource,
  AudioSourceProxy
} from "../components/audio_effect";

const contextQuery = defineQuery([AudioContextComponent]);

export const getAudioContextProxy = (world: IWorld): AudioContextProxy => {
  // Assumes always only single audio context entity exists
  return AudioContextProxy.get(contextQuery(world)[0]);
};

export const addAudioSourceWithAudioSourceNode = (
  world: IWorld,
  eid: number,
  source: MediaStreamAudioSourceNode | MediaElementAudioSourceNode
): void => {
  const context = getAudioContextProxy(world).context;
  const gain = context.createGain();
  const panner = context.createPanner();

  source.connect(gain);
  gain.connect(panner);

  addComponent(world, AudioSource, eid);
  AudioSourceProxy.get(eid).allocate(source, gain, panner);
};

export const addAudioSourceWithElement = (world: IWorld, eid: number, audio: HTMLAudioElement): void => {
  const context = getAudioContextProxy(world).context;
  addAudioSourceWithAudioSourceNode(world, eid, context.createMediaElementSource(audio));
};

export const addAudioSourceWithStream = (world: IWorld, eid: number, stream: MediaStream): void => {
  const context = getAudioContextProxy(world).context;
  addAudioSourceWithAudioSourceNode(world, eid, context.createMediaStreamSource(stream));
};