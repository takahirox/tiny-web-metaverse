import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld
} from "bitecs";
import { Vector3 } from "three";
import {
  AudioDestination,
  AudioSource,
  AudioSourceProxy
} from "../components/audio_effect";
import {
  EntityObject3D,
  EntityObject3DProxy
} from "../components/entity_object3d";
import { getAudioContextProxy } from "../utils/audio_effect";
import { getTimeProxy } from "../utils/time";

const orientation = new Vector3();

const sourceObjectQuery = defineQuery([AudioSource, EntityObject3D]);
const destinationObjectQuery = defineQuery([AudioDestination, EntityObject3D]);

const sourceQuery = defineQuery([AudioSource]);
const enterSourceQuery = enterQuery(sourceQuery);
const exitSourceQuery = exitQuery(sourceQuery);

export const positionalAudioSystem = (world: IWorld): void => {
  // Assumes always one single AudioDestination entity

  exitSourceQuery(world).forEach(eid => {
    const context = getAudioContextProxy(world).context;
    const panner = AudioSourceProxy.get(eid).panner;
    panner.disconnect(context.destination);

    // TODO: Release WebRTC resources?

    AudioSourceProxy.get(eid).free();
  });

  enterSourceQuery(world).forEach(eid => {
    const context = getAudioContextProxy(world).context;
    const panner = AudioSourceProxy.get(eid).panner;
    panner.connect(context.destination);
  });

  sourceObjectQuery(world).forEach(eid => {
    const root = EntityObject3DProxy.get(eid).root;
    const panner = AudioSourceProxy.get(eid).panner;

    orientation.set(0, 0, 1).applyQuaternion(root.quaternion);

    if (panner.positionX) {
      const context = getAudioContextProxy(world).context;
      const delta = getTimeProxy(world).delta;
      const endTime = context.currentTime + delta;

      panner.positionX.linearRampToValueAtTime(root.position.x, endTime);
      panner.positionY.linearRampToValueAtTime(root.position.y, endTime);
      panner.positionZ.linearRampToValueAtTime(root.position.z, endTime);
      panner.orientationX.linearRampToValueAtTime(orientation.x, endTime);
      panner.orientationY.linearRampToValueAtTime(orientation.y, endTime);
      panner.orientationZ.linearRampToValueAtTime(orientation.z, endTime);
    } else {
      panner.setPosition(root.position.x, root.position.y, root.position.z);
      panner.setOrientation(orientation.x, orientation.y, orientation.z);
    }
  });

  destinationObjectQuery(world).forEach(eid => {
    const root = EntityObject3DProxy.get(eid).root;
    const context = getAudioContextProxy(world).context;
    const listener = context.listener;

    orientation.set(0, 0, -1).applyQuaternion(root.quaternion);

    if (listener.positionX) {
      const delta = getTimeProxy(world).delta;
      const endTime = context.currentTime + delta;

      listener.positionX.linearRampToValueAtTime(root.position.x, endTime);
      listener.positionY.linearRampToValueAtTime(root.position.y, endTime);
      listener.positionZ.linearRampToValueAtTime(root.position.z, endTime);
      listener.forwardX.linearRampToValueAtTime(orientation.x, endTime);
      listener.forwardY.linearRampToValueAtTime(orientation.y, endTime);
      listener.forwardZ.linearRampToValueAtTime(orientation.z, endTime);
      listener.upX.linearRampToValueAtTime(root.up.x, endTime);
      listener.upY.linearRampToValueAtTime(root.up.y, endTime);
      listener.upZ.linearRampToValueAtTime(root.up.z, endTime);
    } else {
      listener.setPosition(root.position.x, root.position.y, root.position.z);
      listener.setOrientation(
        orientation.x, orientation.y, orientation.z,
        root.up.x, root.up.y, root.up.z
      );
    }
  });
};
