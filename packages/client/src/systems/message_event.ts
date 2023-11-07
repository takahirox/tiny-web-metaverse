import {
  addComponent,
  defineQuery,
  enterQuery,
  hasComponent,
  IWorld,
  removeComponent
} from "bitecs";
import {
  MessageEvent,
  MessageEventListener,
  MessageEventProxy,
  MessageSender,
  MessageSenderProxy
} from "../components/message_event";
import { NullComponent } from "../components/null";
import { removeEntityIfNoComponent } from "../utils/bitecs";

// TODO: Avoid any
const eventQueue: { data: any }[] = [];

const onReceive = (event: CustomEvent): void => {
  eventQueue.push({ data: event.detail });
};

const addEvent = (world: IWorld, eid: number, data: any): void => {
  if (!hasComponent(world, MessageEvent, eid)) {
    addComponent(world, MessageEvent, eid);
    MessageEventProxy.get(eid).allocate();
  }
  MessageEventProxy.get(eid).add({ data });
};

const senderQuery = defineQuery([MessageSender]);
const initialQuery = enterQuery(defineQuery([NullComponent]));
const listenerQuery = defineQuery([MessageEventListener]);
const eventQuery = defineQuery([MessageEvent]);

export const messageSendSystem = (world: IWorld): void => {
  senderQuery(world).forEach(eid => {
    const proxy = MessageSenderProxy.get(eid);
    window.dispatchEvent(new CustomEvent('from-tiny-web-metaverse', { detail: proxy.data }));
    proxy.free();
    removeComponent(world, MessageSender, eid);
    removeEntityIfNoComponent(world, eid);    
  });
};

export const messageEventReceiveSystem = (world: IWorld): void => {
  // Assumes up to one null entity
  initialQuery(world).forEach(() => {
    window.addEventListener('to-tiny-web-metaverse', onReceive);
  });

  for (const e of eventQueue) {
    listenerQuery(world).forEach(eid => {
      addEvent(world, eid, e.data);
    });
  }
  eventQueue.length = 0;
};

export const clearMessageEventSystem = (world: IWorld): void => {
  eventQuery(world).forEach(eid => {
    const proxy = MessageEventProxy.get(eid);
    proxy.events.length = 0;
    proxy.free();
    removeComponent(world, MessageEvent, eid);
  });
};
