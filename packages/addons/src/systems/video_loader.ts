import {
  addComponent,
  defineQuery,
  enterQuery,
  exitQuery,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import {
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  VideoTexture
} from "three";
import {
  addObject3D,
  Spawned,
  toGenerator
} from "@tiny-web-metaverse/client/src";
import {
  Video,
  VideoLoader,
  VideoLoaderProxy,
  VideoProxy
} from "../components/video";

// TODO: Configurable?
const WIDTH = 1.6 * 0.5;
const HEIGHT = 0.9 * 0.5;

const createVideoObject = (video: HTMLVideoElement): Mesh => {
  const texture = new VideoTexture(video);
  const material = new MeshBasicMaterial({
    color: 0xffffff,
    map: texture,
    side: DoubleSide
  });
  const geometry = new PlaneGeometry(WIDTH, HEIGHT);
  return new Mesh(geometry, material);
};

function* loadVideo(url: string): Generator<void, HTMLVideoElement> {
  const video = document.createElement('video');

  // TODO: Configurable?
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;

  return yield* toGenerator(new Promise((resolve, reject) => {
    video.addEventListener('canplaythrough', () => {
      resolve(video);
    });

    video.addEventListener('error', (error) => {
      reject(error);
    });

    video.src = url;
    video.load();
    video.play();
  }));
}

function* load(world: IWorld, eid: number): Generator<void, void> {
  const url = VideoLoaderProxy.get(eid).url;
  const video = yield* loadVideo(url);

  addComponent(world, Video, eid);
  VideoProxy.get(eid).allocate(video);

  const videoObject = createVideoObject(video);
  addObject3D(world, videoObject, eid);

  if (!hasComponent(world, Spawned, eid)) {
    addComponent(world, Spawned, eid);
  }
}

const loaderQuery = defineQuery([VideoLoader]);
const loaderEnterQuery = enterQuery(loaderQuery);
const loaderExitQuery = exitQuery(loaderQuery);

const generators = new Map<number, Generator>();

export const videoLoadSystem = (world: IWorld): void => {
  loaderExitQuery(world).forEach(eid => {
    generators.delete(eid);
    VideoLoaderProxy.get(eid).free();
  });

  loaderEnterQuery(world).forEach(eid => {
    generators.set(eid, load(world, eid));
  });

  loaderQuery(world).forEach(eid => {
    let done = false;
    try {
      if (generators.get(eid).next().done === true) {
        done = true;
      }
    } catch (error) {
      // TODO: Proper error handling
      console.error(error);
      done = true;
    }
    if (done) {
      removeComponent(world, VideoLoader, eid);
    }
  })
};
