# prerequirements:
# $ pip install selenium
# $ pip install tensorflow
# $ pip install transformers
# $ pip install Jinja2

# TODO: Very sensitive to addons and examples, ex: DOM ids. Fix it.

import argparse
import os
import signal
from selenium import webdriver
from transformers import pipeline, Conversation

parser = argparse.ArgumentParser(description="Run an AI bot.")
parser.add_argument("-u", "--url", dest="url", action="store",
                    default="http://localhost:8080",
                    help="Tiny Web Metaverse url. Default: http://localhost:8080")
parser.add_argument('-r', '--room', dest='room', action='store',
                    default='777',
                    help='Tiny Web Metaverse room number. Default: 777')
parser.add_argument('-n', '--name', dest='name', action='store',
                    default='AI avatar',
                    help='AI avatar name. Default: AI avatar')
parser.add_argument('-l', '--headless', dest='headless', action='store_true',
                    default=False,
                    help='Headless mode')

args = parser.parse_args()

page_url = "{}?room_id={}".format(args.url, args.room)
# TODO: Don't include "'"
username = args.name
headless = args.headless

try:
  chatbot = pipeline("conversational", model="facebook/blenderbot-400M-distill")
  conversation = chatbot(Conversation("Hello"))

  if headless == True:
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    driver = webdriver.Chrome(options=options)
  else:
    driver = webdriver.Chrome()

  driver.set_script_timeout(300)
  driver.get(page_url)
  driver.execute_async_script(
"""
    const callback = arguments[arguments.length - 1];

    // Just in case wait for 1 sec.
    await new Promise(resolve => { setTimeout(resolve, 1000); });

    // Join the room
    const joinDialog = document.getElementById('twmJoinDialog');
    const field = document.getElementById('twmUsernameField');
    field.value = '%s';
    const button = document.getElementById('twmJoinButton');
    button.click();

    // Wait until joining the room
    await new Promise(resolve => {
      const check = () => {
        if (joinDialog.parentElement === null) {
          resolve();
        } else {
          setTimeout(check, 1000);
        }
      };
      check();
    });

    // Post the first chat
    const inputField = document.getElementById('twmTextchatTextField');
    inputField.value = "Hi, I'm %s";

    const chatSendButton = document.getElementById('twmTextchatSendButton');
    chatSendButton.click();

    window.chatAreaValue = document.getElementById('twmTextchatChatArea').value;

    window.dispatchEvent(new CustomEvent('to-tiny-web-metaverse', {detail: {action:'twm_ai_avatar'}}));

    callback();
""" % (username, username)
  )

  while True:
    # Get updated message
    res = driver.execute_async_script(
"""
      const callback = arguments[arguments.length - 1];
      const chatArea = document.getElementById('twmTextchatChatArea');
      let count = 0
      const check = () => {
        count++;

        // Check update in chat
        // TODO: Event driven?
        if (window.chatAreaValue.length !== chatArea.value.length) {
          const diff = chatArea.value.slice(window.chatAreaValue.length).trim();
          window.chatAreaValue = chatArea.value;
          const res = [];
          for (const line of diff.split('\\n')) {
            // Ugh... These matchings and messages are unstable.
            // TODO: More robust
            let match = line.match(/^(.*): (.*)$/);
            if (match) {
              // Ignore my message
              if (match[1] !== '%s') {
                res.push({ name: match[1], message: match[2] });
              }
              continue;
            }

            if (line.match(/^(.*) joined\.$/)) {
              // Ignore joined message
              continue;
            }

            match = line.match(/^(.*) left\.$/);
            if (match) {
              if (match[1] !== '%s') {
                // Experiment: Treat as if a user said Bye
                res.push({ name: match[1], message: 'Bye.' });
              }
              continue;
            }

            match = line.match(/^(.*) changed name to (.*)\.$/);
            if (match) {
              if (match[1] !== '%s') {
                // Experiment: Treat as if a user said Hi
                res.push({ name: match[2], message: `Hi, I am ${match[2]}.` });
              }
              continue;
            }
          }

          callback(res);
        // Periodically return even if no update to avoid timeout
        } else if (count >= 10) {
          callback([]);
        } else {
          setTimeout(check, 10000);
        }
      }
      check();
""" % (username, username, username)
    )

    # Generate and post message
    if res is not None and len(res) > 0:
      for data in res:
        text = data["message"][:128]
        # TODO: Remember conversation
        conversation = Conversation([{ "role": "user", "content": text }])
        conversation = chatbot(conversation)

        driver.execute_async_script(
"""
          const callback = arguments[arguments.length - 1];
          const message = arguments[0];

          const inputField = document.getElementById('twmTextchatTextField');
          inputField.value = message;

          const chatSendButton = document.getElementById('twmTextchatSendButton');

          const check = () => {
            if (chatSendButton.disabled !== true) {
              chatSendButton.click();
              callback();
            } else {
              setTimeout(check, 1000);
            }
          };
          check();
""",
        conversation.messages[-1]["content"])

finally:
  os.kill(driver.service.process.pid,signal.SIGTERM)
