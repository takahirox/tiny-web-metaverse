import {
  defineQuery,
  enterQuery,
  IWorld
} from "bitecs";
import {
  Renderer,
  RendererProxy,
  WindowResizeEvent
} from "@tiny-web-metaverse/client/src";

const resize = (eid: number): void => {
  const renderer = RendererProxy.get(eid).renderer;
  renderer.setSize(window.innerWidth, window.innerHeight);
};

const enterRendererQuery = enterQuery(defineQuery([Renderer]));
const enterRendererWindowResizeQuery =
  enterQuery(defineQuery([Renderer, WindowResizeEvent]));

export const windowSizedRendererSystem = (world: IWorld): void => {
  enterRendererQuery(world).forEach(eid => {
    resize(eid);
  });

  enterRendererWindowResizeQuery(world).forEach(eid => {
    resize(eid);
  });
};
