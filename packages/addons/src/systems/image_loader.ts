import {
  addComponent,
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld,
  removeComponent
} from "bitecs";
import {
  CanvasTexture,
  DoubleSide,
  ImageBitmapLoader,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry
} from "three";
import { addObject3D, toGenerator } from "@tiny-web-metaverse/client/src";
import {
  ImageComponent,
  ImageLoader,
  ImageLoaderProxy,
  ImageProxy
} from "../components/image";

// TODO: Configurable?
const WIDTH = 1.6 * 0.5;
const HEIGHT = 0.9 * 0.5;

// TODO: Expose to utils because this code is duplicated with the video one?
const createImageObject = (image: ImageBitmap): Mesh => {
  const texture = new CanvasTexture(image);
  const material = new MeshBasicMaterial({
    color: 0xffffff,
    map: texture,
    side: DoubleSide
  });
  // TODO: Use the image width/height ratio?
  const geometry = new PlaneGeometry(WIDTH, HEIGHT);
  return new Mesh(geometry, material);
};

function* loadImage(url: string): Generator<void, ImageBitmap> {
  return yield* toGenerator(new Promise((resolve, reject) => {
    const loader = new ImageBitmapLoader();
    // TODO: Should be configurable?
    loader.setOptions({ imageOrientation: 'flipY' });
    loader.load(url, resolve, undefined, reject);
  }));
}

function* load(world: IWorld, eid: number): Generator<void, void> {
  const url = ImageLoaderProxy.get(eid).url;
  const image = yield* loadImage(url);

  addComponent(world, ImageComponent, eid);
  ImageProxy.get(eid).allocate(image);

  const imageObject = createImageObject(image);
  addObject3D(world, imageObject, eid);
}

const loaderQuery = defineQuery([ImageLoader]);
const loaderEnterQuery = enterQuery(loaderQuery);
const loaderExitQuery = exitQuery(loaderQuery);

const generators = new Map<number, Generator>();

export const imageLoadSystem = (world: IWorld): void => {
  loaderExitQuery(world).forEach(eid => {
    generators.delete(eid);
    ImageLoaderProxy.get(eid).free();
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
      removeComponent(world, ImageLoader, eid);
    }
  })
};
