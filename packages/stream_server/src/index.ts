import express, { Express } from "express";
import http from "http";
import * as mediasoup from "mediasoup";
import { Server as SocketServer } from "socket.io";

const LISTEN_PORT = 3000;
const LISTEN_IP = '127.0.0.1';

let webServer: http.Server;
let socketServer: SocketServer;
let worker: mediasoup.types.Worker;
let router: mediasoup.types.Router;

const runWebServer = async () => {
  const app: Express = express();
  app.use(express.static(__dirname));

  // TODO: Use https
  webServer = http.createServer(app);
  webServer.on('error', (error) => {
    // TODO: Proper error handling
    console.error(error);
  });

  await new Promise((resolve) => {
    webServer.listen(LISTEN_PORT, LISTEN_IP, () => {
      console.log('Web server is running.');
      console.log(`Open http://${LISTEN_IP}:${LISTEN_PORT} in your web browser.`);
      resolve(undefined);
    });
  });
};

const runSocketServer = async () => {
  socketServer = new SocketServer(webServer);

  socketServer.on('connection', (socket) => {
    socket.on('getRouterRtpCapabilities', (_data, callback) => {
      callback(router.rtpCapabilities);
    });
  });
};

const createMediasoupWorker = async () => {
  worker = await mediasoup.createWorker({
    logLevel: 'debug'
  });
};

const createMediasoupRouter = async () => {
  router = await worker.createRouter({
    mediaCodecs: [{
      kind: 'audio',
      mimeType: 'audio/opus',
      clockRate: 48000,
      channels: 2
    }, {
      kind: 'video',
      mimeType: 'video/VP8',
      clockRate: 90000,
      parameters: {
        'x-google-start-bitrate': 1000
      }
    }]
  });
};

const run = async () => {
  await runWebServer();
  await runSocketServer();
  await createMediasoupWorker();
  await createMediasoupRouter();
};

run();
