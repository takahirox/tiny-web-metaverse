import {
  addEntity,
  addComponent,
  IWorld
} from "bitecs";
import {
  BroadcastRequestor,
  BroadcastRequestorProxy,
  getMyUserId
} from "@tiny-web-metaverse/client/src";

const ACTION_NAME = 'textchat';

// TODO: Configurable?
const MAX_TEXT_LENGTH = 250;

const clampTextIfNeeded = (text: string): string => {
  if (text.length <= MAX_TEXT_LENGTH) {
    return text;
  }
  return text.slice(0, MAX_TEXT_LENGTH - 3) + '...';
};

export const sendTextChat = (world: IWorld, text: string): void => {
  const eid = addEntity(world);
  addComponent(world, BroadcastRequestor, eid);
  BroadcastRequestorProxy.get(eid).allocate({
    action: ACTION_NAME,
    text: clampTextIfNeeded(text),
    userId: getMyUserId(world)
  });
};

export const isTextChat = (data: any): boolean => {
  return data && data.action === ACTION_NAME;
};

// TODO: Avoid any
// TODO: Validation?
export const parseReceivedTextChat = (data: any): {
  text: string,
  userId: string
} => {
  return {
    text: clampTextIfNeeded(data.text),
    userId: data.userId
  };
};
