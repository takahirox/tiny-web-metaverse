import { defineQuery, exitQuery, IWorld } from "bitecs";
import { ImageComponent, ImageProxy } from "../components/image";

const imageExitQuery = exitQuery(defineQuery([ImageComponent]));

export const imageSystem = (world: IWorld): void => {
  imageExitQuery(world).forEach(eid => {
    const proxy = ImageProxy.get(eid);

    const image = proxy.image;
    image.close();

    proxy.free();
  });	  
};
