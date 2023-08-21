import {
  addComponent,
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld
} from "bitecs";
import {
  MediaDeviceManager,
  MicRequest,
  StreamClient,
  StreamConnectRequest,
  StreamEvent,
  StreamEventProxy,
  StreamMessageType,
  StreamJoinRequest
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

const button = document.createElement('button');
button.innerText = ' Join ';
button.style.position = 'absolute';
button.style.top = '50%';
button.style.left = '50%';
button.style.transform = 'translate(-50%, -50%)';
button.style.zIndex = '10000';

let onClick : () => void | null = null;

const joinDialogQuery = defineQuery([JoinDialog]);
const joinDialogEnterQuery = enterQuery(joinDialogQuery);
const joinDialogExitQuery = exitQuery(joinDialogQuery);
const eventQuery = defineQuery([JoinDialog, StreamEvent]);
const clientQuery = defineQuery([StreamClient]);
const mediaDeviceManagerQuery = defineQuery([MediaDeviceManager]);

const show = (world: IWorld): void => {
  onClick = () => {
    button.disabled = true;
    clientQuery(world).forEach(eid => {
      addComponent(world, StreamConnectRequest, eid);
    });
  };

  button.disabled = false;
  button.addEventListener('click', onClick);

  document.body.appendChild(plane);
  document.body.appendChild(button);
};

const hide = (): void => {
  button.removeEventListener('click', onClick);

  document.body.removeChild(plane);
  document.body.removeChild(button);

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
          clientQuery(world).forEach(clientEid => {
            addComponent(world, StreamJoinRequest, clientEid);
          });
          break;
        case StreamMessageType.Joined:
          hide();

          // Assumes always single media device manager entity exists
          const managerEid = mediaDeviceManagerQuery(world)[0];
          addComponent(world, MicRequest, managerEid);

          break;
        // TODO: Implement Left and Exited
      }
    }
  });
};
