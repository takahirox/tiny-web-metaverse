import {
  addComponent,
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld
} from "bitecs";
import { getTimeProxy } from "@tiny-web-metaverse/client/src";
import {
  TextToModel,
  TextToModelLoader,
  TextToModelLoaderProxy
} from "../components/text_to_model";

const ShapEURL = 'https://huggingface.co/spaces/hysts/Shap-E';

// TODO: Configurable?
const parentElement = document.body;
const eventQueue: { query: string }[] = [];
const OPAQUE = 0.8;
const TRANSPARENT = 0.4;
const MAX_QUERY_LENGTH = 500;
const MAX_QUERY_COUNT = 5;
const SUBMIT_INTERVAL = 5; // In seconds

let leftInterval = 0.0;
let queryCount = 0;

const div = document.createElement('div');
div.style.alignItems = 'center';
div.style.background = 'lightblue';
div.style.borderRadius = '10px';
div.style.display = 'flex';
div.style.flexDirection = 'column';
div.style.gap = '2px';
div.style.padding = '5px';
div.style.placeContent = 'center';
div.style.position = 'absolute';
div.style.right = '10px';
div.style.opacity = `${TRANSPARENT}`;
div.style.top = '10px';
div.style.width = 'min(300px, 30%)';

const toggleButton = document.createElement('button');
toggleButton.innerText = ' Hide Form ';
toggleButton.style.visibility = 'visible';
div.appendChild(toggleButton);

const inputForm = document.createElement('form');
inputForm.style.display = 'flex';
inputForm.style.flexDirection = 'row';
inputForm.style.gap = '2px';
inputForm.style.width = '100%';
div.appendChild(inputForm);

const textField = document.createElement('textarea');
textField.style.borderRadius = '4px';
textField.style.boxSizing = 'border-box';
textField.style.height = '3em';
textField.style.resize = 'none';
textField.style.width = '100%';
inputForm.appendChild(textField);

const submitButton = document.createElement('button');
submitButton.innerText = 'Send';
inputForm.appendChild(submitButton);

const messageSpan = document.createElement('span');
messageSpan.innerText = 'Text to 3D Model';
messageSpan.style.color = 'black';
div.appendChild(messageSpan);

const poweredByLink = document.createElement('span');
const a = document.createElement('a');
a.href = ShapEURL;
a.innerText = 'Powered by Shap-E';
a.target = '_blank';
poweredByLink.appendChild(a);
div.appendChild(poweredByLink);

// toggle

let visibleChat = true;

toggleButton.addEventListener('click', () => {
  if (visibleChat) {
    div.style.visibility = 'hidden';
    toggleButton.innerText = ' Show Form ';
    visibleChat = false;
  } else {
    div.style.visibility = 'visible';
    toggleButton.innerText = ' Hide Form ';
    visibleChat = true;
  }
});

// fadeout effect

let fadeOutStartTime: null | number = null;
let fadingOut = false;
const FADEOUT_INTERVAL = 2000;

let divHovered = false;
let textFieldFocused = false;
let chatFieldFocused = false;

const startFadeOutIfNeeded = (): void => {
  if (divHovered || textFieldFocused || chatFieldFocused) {
    return;
  }

  fadingOut = true;
  fadeOutStartTime = null;
  requestAnimationFrame(fadeOut);	
};

const stopFadeOut = (): void => {
  fadingOut = false;
  fadeOutStartTime = null;
};

const fadeOut = (timestamp: number): void => {
  if (!fadingOut) {
    return;
  }

  if (fadeOutStartTime === null) {
    fadeOutStartTime = timestamp;
  }

  const elapsed = timestamp - fadeOutStartTime;

  if (elapsed >= FADEOUT_INTERVAL) {
    div.style.opacity = `${TRANSPARENT}`;
    stopFadeOut();
  } else {
    div.style.opacity = `${OPAQUE - (OPAQUE - TRANSPARENT) * elapsed * (1.0 / FADEOUT_INTERVAL)}`;
    requestAnimationFrame(fadeOut);
  }
};

div.addEventListener('mouseover', () => {
  divHovered = true;
  stopFadeOut();
  div.style.opacity = `${OPAQUE}`;
});

div.addEventListener('mouseout', () => {
  divHovered = false;
  startFadeOutIfNeeded();
});

textField.addEventListener('focus', () => {
  textFieldFocused = true;
  stopFadeOut();
  div.style.opacity = `${OPAQUE}`;
});

textField.addEventListener('focusout', () => {
  textFieldFocused = false;
  startFadeOutIfNeeded();
});

//

textField.addEventListener('keypress', e => {
  // 13: Enter key
  if (e.keyCode === 13 && !e.shiftKey) {
    e.preventDefault();
    submitButton.click();
  }
  e.stopPropagation();
});

textField.addEventListener('keyup', e => {
  e.stopPropagation();
});

textField.addEventListener('keydown', e => {
  e.stopPropagation();
});

submitButton.addEventListener('click', e => {
  e.preventDefault();

  // Just in case...
  if (submitButton.disabled === true ||
    leftInterval > 0 ||
    queryCount >= MAX_QUERY_COUNT) {
    return;
  }

  const text = textField.value.trim();

  if (!text) {
    return;
  }

  // TODO: Warning if the query length is over MAX_QUERY_LENGTH?
  eventQueue.push({ query: text.slice(0, MAX_QUERY_LENGTH) });
  queryCount++;
  submitButton.disabled = true;
  textField.disabled = true;
  messageSpan.innerText = 'Processing...';
});

//

const textToModelQuery = defineQuery([TextToModel]);
const enterTextToModelQuery = enterQuery(textToModelQuery);
const exitTextToModelQuery = exitQuery(textToModelQuery);

const exitLoaderQuery = exitQuery(defineQuery([TextToModelLoader]));

export const textToModelUISystem = (world: IWorld): void => {
  // Assumes up to one TextToModel entiry

  exitTextToModelQuery(world).forEach(() => {
    parentElement.removeChild(div);
  });

  enterTextToModelQuery(world).forEach(() => {
    parentElement.appendChild(div);
  });

  textToModelQuery(world).forEach(eid => {
    for (const e of eventQueue) {
      addComponent(world, TextToModelLoader, eid);
      TextToModelLoaderProxy.get(eid).allocate(e.query);
      //
      break;
    }

    // 
    if (submitButton.disabled === true && exitLoaderQuery(world).length > 0) {
      // To prevent flood requests.
      if (queryCount >= MAX_QUERY_COUNT) {
        textField.value = '';
        messageSpan.innerText = `Max ${MAX_QUERY_COUNT} queries per client`;
      } else {
        leftInterval = SUBMIT_INTERVAL;
      }
    } else if (leftInterval > 0.0) {
      leftInterval -= getTimeProxy(world).delta;
      if (leftInterval <= 0.0) {
        leftInterval = 0.0;
        submitButton.disabled = false;
        textField.disabled = false;
        textField.value = '';
        messageSpan.innerText = 'Text to 3D Model';
	  } else {
        messageSpan.innerText = `${leftInterval.toFixed(2)} secs until the next query`;
      }
    }
  });

  eventQueue.length = 0;
};
