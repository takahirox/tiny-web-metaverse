import {
  defineQuery,
  enterQuery,
  exitQuery,
  IWorld
} from "bitecs";
import {
  getAudioContextProxy,
  getPeersProxy,
  NetworkEvent,
  NetworkEventProxy,
  NetworkMessageType
} from "@tiny-web-metaverse/client/src";
import { TextChat } from "../components/textchat";
import {
  isTextChat,
  parseReceivedTextChat,
  sendTextChat
} from "../utils/textchat";

// UI + Event handler + Sender

// TODO: Configurable (via CSS)?
// TODO: Movable?
// TODO: WebXR support. How?

const parentElement = document.body;
const eventQueue: {
  text: string
}[] = [];

const OPAQUE = 0.8;
const TRANSPARENT = 0.4;

const chatDiv = document.createElement('div');
chatDiv.style.alignItems = 'center';
chatDiv.style.background = 'lightblue';
chatDiv.style.borderRadius = '10px';
chatDiv.style.display = 'flex';
chatDiv.style.flexDirection = 'column';
chatDiv.style.gap = '2px';
chatDiv.style.height = 'min(400px, 60%)';
chatDiv.style.left = '10px';
chatDiv.style.opacity = `${TRANSPARENT}`;
chatDiv.style.padding = '5px';
chatDiv.style.placeContent = 'center';
chatDiv.style.position = 'absolute';
chatDiv.style.top = '10px';
chatDiv.style.width = 'min(300px, 50%)';

const toggleButton = document.createElement('button');
toggleButton.innerText = ' Hide Chat ';
toggleButton.style.visibility = 'visible';
chatDiv.appendChild(toggleButton);

const chatField = document.createElement('textarea');
chatField.id = 'twmTextchatChatArea';
chatField.readOnly = true;
chatField.style.background = 'lightblue';
chatField.style.borderRadius = '4px';
chatField.style.boxSizing = 'border-box';
chatField.style.flex = '1';
chatField.style.resize = 'none';
chatField.style.width = '100%';
chatDiv.appendChild(chatField);

const inputForm = document.createElement('form');
inputForm.style.display = 'flex';
inputForm.style.flexDirection = 'row';
inputForm.style.gap = '2px';
inputForm.style.width = '100%';
chatDiv.appendChild(inputForm);

const textField = document.createElement('textarea');
textField.id = 'twmTextchatTextField';
textField.style.borderRadius = '4px';
textField.style.boxSizing = 'border-box';
textField.style.height = '3em';
textField.style.resize = 'none';
textField.style.width = '100%';
inputForm.appendChild(textField);

const sendButton = document.createElement('button');
sendButton.id = 'twmTextchatSendButton';
sendButton.innerText = 'Send';
inputForm.appendChild(sendButton);

const SUBMIT_INTERVAL = 1000;

sendButton.addEventListener('click', e => {
  e.preventDefault();

  const text = textField.value.trim();

  if (!text) {
    return;
  }

  eventQueue.push({ text });
  textField.value = '';
  sendButton.disabled = true;

  // Prevent repeated posts
  setTimeout(() => {
    sendButton.disabled = false;
  }, SUBMIT_INTERVAL);
});

// toggle

let visibleChat = true;

toggleButton.addEventListener('click', () => {
  if (visibleChat) {
    chatDiv.style.visibility = 'hidden';
    toggleButton.innerText = ' Show Chat ';
    visibleChat = false;
  } else {
    chatDiv.style.visibility = 'visible';
    toggleButton.innerText = ' Hide Chat ';
    visibleChat = true;
  }
});

// fadeout effect

let fadeOutStartTime: null | number = null;
let fadingOut = false;
const FADEOUT_INTERVAL = 2000;

let chatDivHovered = false;
let textFieldFocused = false;
let chatFieldFocused = false;

const startFadeOutIfNeeded = (): void => {
  if (chatDivHovered || textFieldFocused || chatFieldFocused) {
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
    chatDiv.style.opacity = `${TRANSPARENT}`;
    stopFadeOut();
  } else {
    chatDiv.style.opacity = `${OPAQUE - (OPAQUE - TRANSPARENT) * elapsed * (1.0 / FADEOUT_INTERVAL)}`;
    requestAnimationFrame(fadeOut);
  }
};

chatDiv.addEventListener('mouseover', () => {
  chatDivHovered = true;
  stopFadeOut();
  chatDiv.style.opacity = `${OPAQUE}`;
});

chatDiv.addEventListener('mouseout', () => {
  chatDivHovered = false;
  startFadeOutIfNeeded();
});

chatField.addEventListener('focus', () => {
  chatFieldFocused = true;
  stopFadeOut();
  chatDiv.style.opacity = `${OPAQUE}`;
});

chatField.addEventListener('focusout', () => {
  chatFieldFocused = false;
  startFadeOutIfNeeded();
});

textField.addEventListener('focus', () => {
  textFieldFocused = true;
  stopFadeOut();
  chatDiv.style.opacity = `${OPAQUE}`;
});

textField.addEventListener('focusout', () => {
  textFieldFocused = false;
  startFadeOutIfNeeded();
});

textField.addEventListener('keypress', e => {
  // 13: Enter key
  if (e.keyCode === 13 && !e.shiftKey) {
    e.preventDefault();
    sendButton.click();
  }
  e.stopPropagation();
});

textField.addEventListener('keyup', e => {
  e.stopPropagation();
});

textField.addEventListener('keydown', e => {
  e.stopPropagation();
});

textField.addEventListener('keypress', e => {
  e.stopPropagation();
});

chatField.addEventListener('keyup', e => {
  e.stopPropagation();
});

chatField.addEventListener('keydown', e => {
  e.stopPropagation();
});

// beep

// TODO: Improve

let oscillator: OscillatorNode;
let gain: GainNode;

const beep = (world: IWorld): void => {
  // Disable for now
  if (true) {
    return;
  }

  if (oscillator || gain) {
    return;
  }

  const context = getAudioContextProxy(world).context;

  oscillator = context.createOscillator();
  gain = context.createGain();

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.frequency.value = 660;
  gain.gain.value = 0.01;

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + 0.05);

  oscillator.addEventListener('ended', () => {
    oscillator.disconnect(gain);
    gain.disconnect(context.destination);

    oscillator = null;
    gain = null;
  });
};

//

const addText = (world: IWorld, text: string): void => {
  chatField.value += '\n' + chatField.innerText + text;
  chatField.scrollTop = chatField.scrollHeight;
  beep(world);
};

//

const getUsername = (world: IWorld, userId: string): string => {
  const peers = getPeersProxy(world).peers;
  return peers.has(userId) ? peers.get(userId).username : userId;
};

const getPreviousUsername = (world: IWorld, userId: string): string => {
  const peers = getPeersProxy(world).peers;
  return peers.has(userId) ? peers.get(userId).previousUsername : userId;
};

const chatQuery = defineQuery([TextChat]);
const enterChatQuery = enterQuery(chatQuery);
const exitChatQuery = exitQuery(chatQuery);

const receiverQuery = defineQuery([TextChat, NetworkEvent]);

export const textChatUISystem = (world: IWorld): void => {
  // Assumes up to one sender entity

  exitChatQuery(world).forEach(() => {
    parentElement.removeChild(chatDiv);
  });

  enterChatQuery(world).forEach(() => {
    parentElement.appendChild(chatDiv);
  });

  chatQuery(world).forEach(() => {
    for (const e of eventQueue) {
      sendTextChat(world, e.text);
    }
  });

  eventQueue.length = 0;

  receiverQuery(world).forEach(eid => {
    for (const e of NetworkEventProxy.get(eid).events) {
      if (e.type === NetworkMessageType.Broadcast) {
        if (isTextChat(e.data)) {
          e.data.text = e.data.text.trim();
          const data = parseReceivedTextChat(e.data);
          addText(world, `${getUsername(world, data.userId)}: ${data.text}`);
        }
      } else if (e.type === NetworkMessageType.UserJoined) {
        addText(world, `${e.data.username} joined.`);
      } else if (e.type === NetworkMessageType.UserLeft) {
        addText(world, `${getUsername(world, e.data)} left.`);
      } else if (e.type === NetworkMessageType.UsernameChange) {
        const userId = e.data && e.data.user_id;
        addText(world, `${getPreviousUsername(world, userId)} changed name to ${getUsername(world, userId)}.`);
      }
    }
  });
};
