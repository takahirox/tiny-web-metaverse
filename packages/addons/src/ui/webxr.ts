// WebXR requestSession() needs to be called in user action (button click),
// so regular systems that are called in tick() invoked from requestAnimationFrame
// can't handle it.
// Istead we have introduces this UI system that manages buttons that exceptionally
// handle WebXR asynchronously outside of tick().
// Creators may customize buttons so this system is placed in addons instead of
// in client core.

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

// TODO: Recheck when plugged-in device changes

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
  mode: XRSessionMode,
  session: XRSession,
  type: WebXRSessionEventType
}[] = [];

let sessionRequesting = false;
let currentSessionMode: XRSessionMode | null = null;
let currentSession: XRSession | null = null;

// TODO: Configurable

const defaultSessionInit: XRSessionInit = {
  optionalFeatures: [
    'bounded-floor',
    'hand-tracking',
    'layers',
    'local-floor'
  ]
};

const onSessionStarted = async (mode: XRSessionMode, session: XRSession): Promise<void> => {
  // Which should the followings be, before or after await?

  currentSession = session;
  currentSessionMode = mode;

  session.addEventListener('end', onSessionEnded);

  sessionEventQueue.push({
    mode,
    session,
    type: WebXRSessionEventType.Start
  });

  if (currentWorld !== null) {
    await getRendererProxy(currentWorld).renderer.xr.setSession(session);

    // There is a possibility that session ends while waiting.
    if (currentSession === null) {
      return;
    }
  } else {
    console.error(`Session starts before the WebXR UI system runs. This is a limiation. Try to start session again after the system runs.`);
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
};

const onSessionEnded = (): void => {
  currentSession.removeEventListener('end', onSessionEnded);

  sessionEventQueue.push({
    mode: currentSessionMode,
    session: currentSession,
    type: WebXRSessionEventType.End
  });

  vrButton.innerText = 'START VR';
  arButton.innerText = 'START AR';

  enableButton(vrButton);
  enableButton(arButton);

  sessionRequesting = false;
  currentSession = null;
  currentSessionMode = null;
};

const onButtonClick = (mode: XRSessionMode): void => {
  if (sessionRequesting) {
    return;
  }

  sessionRequesting = true;

  disableButton(vrButton);
  disableButton(arButton);

  if (currentSession === null) {
    const sessionInit = Object.assign({}, defaultSessionInit);

    // Hack and experiment:
    // If an element names "WebXRDomOverlayRoot" is found
    // enable WebXR dom-overlay feature with the element.
    // TODO: Fix me, more elegant API
    if (!sessionInit.optionalFeatures || !sessionInit.optionalFeatures.includes('dom-overlay')) {
      const domOverlayRoot = document.getElementById('WebXRDomOverlayRoot');

      if (domOverlayRoot !== null) {
        sessionInit.optionalFeatures = sessionInit.optionalFeatures || [];
        sessionInit.optionalFeatures.push('dom-overlay');
        sessionInit.domOverlay = { root: domOverlayRoot };
      }
    }

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

// Three.js WebGLRenderer.xr.setSession seems to need to be called
// immediately after session start. So regular systems that are called
// in tick() invoked by requestAnimationFrame can't handle it.
// I guess that's because regular requestAnimationFrame may be canceled
// when session starts?
// As hack, exceptionally stores world to access WebGLRenderer
// outside of tick(). Then when session starts on session start
// handler accesses world used in previous frame but probably
// it won't be a serious problem because world is not replaced
// with a new one once it's created.
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
    addWebXRSessionEvent(world, e.type, e.mode, e.session);
  }

  sessionEventQueue.length = 0;
};
