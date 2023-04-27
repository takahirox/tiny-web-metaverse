import * as mediasoup from "mediasoup";

export const LISTEN_PORT = parseInt(process.env.MEDIASOUP_LISTEN_PORT) || 3000;
export const LISTEN_IP = process.env.MEDIASOUP_LISTEN_IP || '127.0.0.1';
export const ANNOUNCED_IP = process.env.MEDIASOUP_ANNOUNCED_IP || '127.0.0.1';
// TODO: Configurable
export const RTC_MAX_PORT = parseInt(process.env.MEDIASOUP_RTC_MAX_PORT) || 2100;
export const RTC_MIN_PORT = parseInt(process.env.MEDIASOUP_RTC_MIN_PORT) || 2000;
export const LOG_LEVEL = 'debug';
export const MEDIA_CODECS: mediasoup.types.RtpCodecCapability[] = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters: {
      'x-google-start-bitrate': 1000
    }
  }
];
