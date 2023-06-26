const express = require('express');
// TODO: Use https
const http = require('http');
const mediasoup = require('mediasoup');
const socketIO = require('socket.io');

const LISTEN_PORT = 3000;
const LISTEN_IP = '127.0.0.1';

const run = async () => {
  const expressApp = express();
  expressApp.use(express.static(__dirname));

  const webServer = http.createServer(expressApp);
  webServer.on('error', (error) => {
    // TODO: Proper error handling
    console.error(error);
  });

  await new Promise((resolve) => {
	webServer.listen(LISTEN_PORT, LISTEN_IP, () => {
      console.log('Web server is running.');
      console.log(`Open http://${LISTEN_IP}:${LISTEN_PORT} in your web browser.`);
      resolve();
    });
  });

  const socketServer = socketIO(webServer);

  let producerTransport = null;
  let consumerTransport = null;
  let producer = null;
  let consumer = null;

  socketServer.on('connection', (socket) => {
    console.log('client connected');

    socket.on('getRouterRtpCapabilities', (data, callback) => {
      callback(router.rtpCapabilities);
    });

    socket.on('createProducerTransport', async (data, callback) => {
      producerTransport = await router.createWebRtcTransport({
        listenIps: [LISTEN_IP],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true
	  });
      callback({
        id: producerTransport.id,
        iceParameters: producerTransport.iceParameters,
        iceCandidates: producerTransport.iceCandidates,
        dtlsParameters: producerTransport.dtlsParameters
      });
    });

    socket.on('createConsumerTransport', async (data, callback) => {
      consumerTransport = await router.createWebRtcTransport({
        listenIps: [LISTEN_IP],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true
	  });
      callback({
        id: consumerTransport.id,
        iceParameters: consumerTransport.iceParameters,
        iceCandidates: consumerTransport.iceCandidates,
        dtlsParameters: consumerTransport.dtlsParameters
      });
    });

    socket.on('connectProducerTransport', async (data, callback) => {
      await producerTransport.connect({ dtlsParameters: data.dtlsParameters });
      callback();
    });

    socket.on('connectConsumerTransport', async (data, callback) => {
      await consumerTransport.connect({ dtlsParameters: data.dtlsParameters });
      callback();
    });

    socket.on('produce', async (data, callback) => {
      const { kind, rtpParameters } = data;
      producer = await producerTransport.produce({ kind, rtpParameters });
      callback({ id: producer.id });
    });

    socket.on('consume', async (data, callback) => {
      if (!router.canConsume({ producerId: producer.id, rtpCapabilities: data.rtpCapabilities })) {
        console.error('can not consume');
        return;
      }

      consumer = await consumerTransport.consume({
        producerId: producer.id,
        rtpCapabilities: data.rtpCapabilities,
        paused: true
      })
      callback({
        producerId: producer.id,
        id: consumer.id,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        type: consumer.type,
        producerPaused: consumer.producerPaused
	  });
    });

    socket.on('resume', async (data, callback) => {
      await consumer.resume();
      callback();
    });
  });

  const worker = await mediasoup.createWorker({
    logLevel: 'debug'
  });
  const router = await worker.createRouter({
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
}

run();
