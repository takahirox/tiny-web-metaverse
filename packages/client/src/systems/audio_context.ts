import {
  addComponent,
  defineQuery,
  exitQuery,
  IWorld,
  Not,
  removeComponent
} from "bitecs";
import {
  AudioContextComponent,
  AudioContextProxy,
  AudioContextResuming,
  AudioContextSuspended
} from "../components/audio_effect";
import { toGenerator } from "../utils/coroutine";

const suspendedContextQuery = defineQuery([
  AudioContextComponent,
  Not(AudioContextResuming),
  AudioContextSuspended
]);
const resumingContextQuery = defineQuery([
  AudioContextComponent,
  AudioContextResuming,
  AudioContextSuspended
]);
const exitResumingQuery = exitQuery(defineQuery([AudioContextResuming]));

function* resume(world: IWorld, eid: number): Generator<void, void> {
  const context = AudioContextProxy.get(eid).context;
  // TODO: Add timeout because resume() might not be resolved?
  yield* toGenerator(context.resume());
  removeComponent(world, AudioContextSuspended, eid);
}

const generators = new Map<number, Generator>();

// On some platforms AudioContext instance is created with
// 'suspend' state. Its resume() method needs to be called
// after user interaction. Otherwise, no audio comes out.

// Assumes that AudioContextComponent component and entity are not removed
// once they are added, and AudioContextResuming component is added/removed
// only in this system.

let warned = false;

const hasBeenActive = (): boolean => {
  // TODO: Supported in all modern browsers?
  //       If not add polyfill?
  if (!('userActivation' in navigator)) {
    if (!warned) {
      console.warn('No navigator.userActivation and impossible to detect first user activation. Report to the tiny-web-metaverse author.');
      warned = true;
    }
    return false;
  }
  // TODO: Avoid any
  return (navigator.userActivation as any).hasBeenActive;
};

export const resumeAudioContextSystem = (world: IWorld): void => {
  exitResumingQuery(world).forEach(eid => {
    generators.delete(eid);
  });

  suspendedContextQuery(world).forEach(eid => {
    if (!hasBeenActive()) {
      return;
    }
    generators.set(eid, resume(world, eid));
    addComponent(world, AudioContextResuming, eid);
  });

  resumingContextQuery(world).forEach(eid => {
    let done = false;
    try {
      if (generators.get(eid).next().done === true) {
        done = true;
      }
    } catch (e) {
      console.error(e);
      done = true;
    }
    if (done) {
      removeComponent(world, AudioContextResuming, eid);
    }
  })
};
