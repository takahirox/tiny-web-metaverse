const mediasoupClient = require('mediasoup-client');
const socketClient = require('socket.io-client');

const protocol = window.location.protocol;
const hostname = window.location.hostname;
const LISTEN_PORT = 3000;

let socket = null;
let device = null;

const logDiv = document.createElement('div');
const addLog = (message) => {
  return;

  const div = document.createElement('div');
  div.innerText = message;
  logDiv.appendChild(div);
};

const socketRequest = (socket, type, data = {}) => {
  return new Promise((resolve) => {
    socket.emit(type, data, resolve);
  });
};

const connect = async () => {
  const serverUrl = `${protocol}//${hostname}:${LISTEN_PORT}`;
  const opts = {};

  addLog('connecting.');

  socket = socketClient(serverUrl, opts);
  socket.on('connect', async () => {
    addLog('connected.')
    const capabilities = await socketRequest(socket, 'getRouterRtpCapabilities');
    addLog(JSON.stringify(capabilities));
    device = new mediasoupClient.Device();
    await device.load({ routerRtpCapabilities: capabilities });
  });
};

const publish = async () => {
  const data = await socketRequest(socket, 'createProducerTransport', {
    forceTcp: false,
    rtpCapabilities: device.rtpCapabilities
  });
  addLog(JSON.stringify(data));

  const transport = device.createSendTransport(data);
  console.log(transport);
  addLog(JSON.stringify(transport));

  transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
    socketRequest(socket, 'connectProducerTransport', { dtlsParameters }) 
      .then(callback)
      .catch(errback);
  });

  transport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
    const { id } = await socketRequest(socket, 'produce', {
      transportId: transport.id,
      kind,
      rtpParameters
    });
    callback({ id });
  });

  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  const track = stream.getVideoTracks()[0];
  const producer = await transport.produce({ track });

  const video = document.createElement('video');
  video.srcObject = stream;
  video.autoplay = true;
  video.controls = true;
  video.playsinline = true;
  document.body.appendChild(video);
};

const subscribe = async () => {
  const transportData = await socketRequest(socket, 'createConsumerTransport', {
    forceTcp: false
  });
  console.log(transportData);

  const transport = device.createRecvTransport(transportData);

  transport.on('connect', ({ dtlsParameters }, callback, errback) => {
    socketRequest(socket, 'connectConsumerTransport', {
      transportId: transport.id,
      dtlsParameters
    })
      .then(callback)
      .catch(errback);
  });

  const { rtpCapabilities } = device;
  const {
    producerId,
    id,
    kind,
    rtpParameters,
  } = await socketRequest(socket, 'consume', { rtpCapabilities });

  const consumer = await transport.consume({
    id,
    producerId,
    kind,
    rtpParameters,
    codecOptions: {}
  });

  const stream = new MediaStream();
  stream.addTrack(consumer.track);

  transport.on('connectionstatechange', async (state) => {
    console.log(state);
    switch (state) {
      case 'connected':
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.controls = true;
        video.playsinline = true;
        await socketRequest(socket, 'resume');
        document.body.appendChild(video);
        break;
    }
  });
};

const connectButton = document.createElement('button');
connectButton.innerText = 'connect';
connectButton.addEventListener('click', connect);
document.body.appendChild(connectButton);

const webcamButton = document.createElement('button');
webcamButton.innerText = 'webcam';
webcamButton.addEventListener('click', publish);
document.body.appendChild(webcamButton);

const subscribeButton = document.createElement('button');
subscribeButton.innerText = 'subscribe';
subscribeButton.addEventListener('click', subscribe);
document.body.appendChild(subscribeButton);

document.body.appendChild(logDiv);
