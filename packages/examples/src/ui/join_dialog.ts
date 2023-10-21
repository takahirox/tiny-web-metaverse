import {
  addComponent,
  addEntity,
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld
} from "bitecs";
import {
  MicRequestor,
  StreamConnectRequestor,
  StreamEvent,
  StreamEventProxy,
  StreamMessageType,
  StreamJoinRequestor,
  UsernameChangeRequestor,
  UsernameChangeRequestorProxy
} from "@tiny-web-metaverse/client/src";
import { JoinDialog } from "../components/join_dialog";

const plane = document.createElement('span');
plane.style.position = 'absolute';
plane.style.top = '0';
plane.style.left = '0';
plane.style.width = '100%';
plane.style.height = '100%';
plane.style.zIndex = '9999';
plane.style.background = '#fff';
plane.style.opacity = '0.5';

const joinForm = document.createElement('form');
joinForm.style.position = 'absolute';
joinForm.style.top = '50%';
joinForm.style.left = '50%';
joinForm.style.transform = 'translate(-50%, -50%)';
joinForm.style.zIndex = '10000';

const usernameForm = document.createElement('input');
usernameForm.id = 'usernameForm';
usernameForm.type = 'text';
usernameForm.value = 'Your name';
usernameForm.style.marginRight = '1em';
joinForm.appendChild(usernameForm);

const button = document.createElement('button');
button.innerText = ' Join ';
joinForm.appendChild(button);

let onClick : (e: Event) => void | null = null;

const joinDialogQuery = defineQuery([JoinDialog]);
const joinDialogEnterQuery = enterQuery(joinDialogQuery);
const joinDialogExitQuery = exitQuery(joinDialogQuery);
const eventQuery = defineQuery([JoinDialog, StreamEvent]);

const MAX_USERNAME_LENGTH = 16;
const clampUsernameIfNeeded = (str: string): string => {
  if (str.length <= MAX_USERNAME_LENGTH) {
    return str;
  }
  return str.slice(0, MAX_USERNAME_LENGTH - 3) + '...';
};

const show = (world: IWorld): void => {
  onClick = e => {
    e.preventDefault();

    button.disabled = true;
    addComponent(world, StreamConnectRequestor, addEntity(world));

    const eid = addEntity(world);
    addComponent(world, UsernameChangeRequestor, eid);
    UsernameChangeRequestorProxy.get(eid).allocate(clampUsernameIfNeeded(usernameForm.value));
  };

  button.disabled = false;
  button.addEventListener('click', onClick);

  document.body.appendChild(plane);
  document.body.appendChild(joinForm);
};

const hide = (): void => {
  button.removeEventListener('click', onClick);

  document.body.removeChild(plane);
  document.body.removeChild(joinForm);

  onClick = null;
};

export const updateJoinDialogSystem = (world: IWorld): void => {
  joinDialogExitQuery(world).forEach(() => {
    hide();
  });

  joinDialogEnterQuery(world).forEach(() => {
    // Assumes stream is not connected when entered.
    show(world);
  });

  eventQuery(world).forEach(eid => {
    for (const event of StreamEventProxy.get(eid).events) {
      switch (event.type) {
        case StreamMessageType.Connected:
          addComponent(world, StreamJoinRequestor, addEntity(world));
          break;
        case StreamMessageType.Joined:
          hide();
          addComponent(world, MicRequestor, addEntity(world));
          break;
        // TODO: Implement Left and Exited
      }
    }
  });
};
