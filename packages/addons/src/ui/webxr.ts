// WebXR requestSession() needs to be called in user action (button click)
// so this UI system that manages buttons for WebXR, rather than systems that
// calls the function in tick(), is needed for WebXR app

import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld
} from "bitecs";
import {
  addWebXRSessionEvent,
  getRendererProxy,
  WebXRSessionEventType
} from "@tiny-web-metaverse/client/src";
import { WebXRARButton, WebXRVRButton } from "../components/webxr";

// TODO: Configurable?
const parentElement = document.body;
const OPAQUE = 1.0;
const TRANSPARENT = 0.5;
const DISABLED = 0.2;

const buttonsDiv = document.createElement('div');
buttonsDiv.style.bottom = '20px';
buttonsDiv.style.left = '50%';
buttonsDiv.style.position = 'absolute';
buttonsDiv.style.translate = 'calc(-50%)';
parentElement.appendChild(buttonsDiv);

// Style is from Three.js

const stylizeButton = (button: HTMLButtonElement): void => {
  button.style.background = 'rgba(0.0, 0.0, 0.0, 0.1)';
  button.style.border = '1px solid #fff';
  button.style.borderRadius = '4px';
  button.style.color = '#fff';
  button.style.cursor = 'pointer';
  button.style.display = 'none';
  button.style.font = 'normal 13px sans-serif';
  button.style.marginLeft = '1px';
  button.style.marginRight = '1px';
  button.style.opacity = '0.5';
  button.style.outline = 'none';
  button.style.padding = '12px 6px';
  button.style.textAlign = 'center';
  button.style.width = '100px';
};

const vrButton = document.createElement('button');
vrButton.innerText = 'START VR';
stylizeButton(vrButton);

const arButton = document.createElement('button');
arButton.innerText = 'START AR';
stylizeButton(arButton);

//

const onSessionSupported = (supported: boolean, button: HTMLButtonElement): void => {
  if (supported) {
    button.style.display = '';
  }
};

if ('xr' in navigator) {
  navigator.xr
    .isSessionSupported('immersive-vr')
    .then(supported => onSessionSupported(supported, vrButton));
  navigator.xr
    .isSessionSupported('immersive-ar')
    .then(supported => onSessionSupported(supported, arButton));
}

//

const hoveredButtons = new Set();

const disableButton = (button: HTMLButtonElement): void => {
  button.disabled = true;
  button.style.opacity = `${DISABLED}`;
};

const enableButton = (button: HTMLButtonElement): void => {
  button.disabled = false;
  button.style.opacity = hoveredButtons.has(button) ? `${OPAQUE}` : `${TRANSPARENT}`;
};

const onMouseenter = (e: MouseEvent): void => {
  const button = e.target as HTMLButtonElement;

  hoveredButtons.add(button);

  if (button.disabled) {
    return;
  }

  button.style.opacity = `${OPAQUE}`;
};

const onMouseleave = (e: MouseEvent): void => {
  const button = e.target as HTMLButtonElement;

  hoveredButtons.delete(button);

  if (button.disabled) {
    return;
  }

  button.style.opacity = `${TRANSPARENT}`;
};

vrButton.addEventListener('mouseenter', onMouseenter);
vrButton.addEventListener('mouseleave', onMouseleave);
arButton.addEventListener('mouseenter', onMouseenter);
arButton.addEventListener('mouseleave', onMouseleave);

//

const sessionEventQueue: {
  session: XRSession,
  type: WebXRSessionEventType
}[] = [];

let sessionRequesting = false;
let currentSession: XRSession | null = null;

// TODO: Configurable

const sessionInit = {
  optionalFeatures: [
    'local-floor',
    'bounded-floor',
    'hand-tracking',
    'layers'
  ]
};

const onSessionStarted = async (mode: XRSessionMode, session: XRSession): Promise<void> => {
  session.addEventListener('end', onSessionEnded);

  sessionEventQueue.push({
    session,
    type: WebXRSessionEventType.Start
  });

  if (currentWorld !== null) {
    await getRendererProxy(currentWorld).renderer.xr.setSession(session);
  } else {
    // TODO: Write comment
    session.end();
    return;
  }

  if (mode === 'immersive-vr') {
    vrButton.innerText = 'STOP VR';
    enableButton(vrButton);
    disableButton(arButton);
  } else {
    arButton.innerText = 'STOP AR';
    enableButton(arButton);
    disableButton(vrButton);
  }

  currentSession = session;
};

const onSessionEnded = (): void => {
  currentSession.removeEventListener('end', onSessionEnded);

  sessionEventQueue.push({
    session: currentSession,
    type: WebXRSessionEventType.End
  });

  vrButton.innerText = 'START VR';
  arButton.innerText = 'START AR';

  enableButton(vrButton);
  enableButton(arButton);

  sessionRequesting = false;
  currentSession = null;
};

const onButtonClick = (mode: XRSessionMode): void => {
  if (sessionRequesting) {
    return;
  }

  sessionRequesting = true;

  disableButton(vrButton);
  disableButton(arButton);

  if (currentSession === null) {
    navigator.xr
      .requestSession(mode, sessionInit)
      .then(session => onSessionStarted(mode, session))
      .catch(e => {
        enableButton(vrButton);
        enableButton(arButton);
        console.error(e);
      })
      .finally(() => {
        sessionRequesting = false;
      });
  } else {
    currentSession.end();
  }
};

vrButton.addEventListener('click', () => onButtonClick('immersive-vr'));
arButton.addEventListener('click', () => onButtonClick('immersive-ar'));

//

const vrButtonQuery = defineQuery([WebXRVRButton]);
const enterVrButtonQuery = enterQuery(vrButtonQuery);
const exitVrButtonQuery = exitQuery(vrButtonQuery);

const arButtonQuery = defineQuery([WebXRARButton]);
const enterArButtonQuery = enterQuery(arButtonQuery);
const exitArButtonQuery = exitQuery(arButtonQuery);

// TODO: Write comment
let currentWorld: IWorld | null = null;

export const webXrButtonsUISystem = (world: IWorld): void => {
  currentWorld = world;

  // Assumes up to one button and webxr entity for each

  exitVrButtonQuery(world).forEach(() => {
    buttonsDiv.removeChild(vrButton);	  
  });

  enterVrButtonQuery(world).forEach(() => {
    buttonsDiv.appendChild(vrButton);	  
  });

  exitArButtonQuery(world).forEach(() => {
    buttonsDiv.removeChild(arButton);	  
  });

  enterArButtonQuery(world).forEach(() => {
    buttonsDiv.appendChild(arButton);	  
  });

  for (const e of sessionEventQueue) {
    addWebXRSessionEvent(world, e.type, e.session);
  }

  sessionEventQueue.length = 0;
};
