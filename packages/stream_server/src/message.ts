import * as mediasoup from "mediasoup";

export type TransportParams = {
  id: string;
  iceParameters: mediasoup.types.IceParameters;
  iceCandidates: mediasoup.types.IceCandidate[];
  dtlsParameters: mediasoup.types.DtlsParameters;
};

export type ConsumerParams = {
  id: string;
  consumerPeerId: string;
  producerPeerId: string;
  producerId: string;
  kind: mediasoup.types.MediaKind;
  rtpParameters: mediasoup.types.RtpParameters;
  type: mediasoup.types.ConsumerType;
  producerPaused: boolean;
};

export type ErrorParams = {
  message: string;
};

export const getTransportParams = (
  transport: mediasoup.types.WebRtcTransport
): TransportParams => {
  return {
    id: transport.id,
    iceParameters: transport.iceParameters,
    iceCandidates: transport.iceCandidates,
    dtlsParameters: transport.dtlsParameters
  };
};

export const getConsumerParams = (
  consumerPeerId: string,
  producerPeerId: string,
  producerId: string,
  consumer: mediasoup.types.Consumer
): ConsumerParams => {
  return {
    id: consumer.id,
    consumerPeerId,
    producerPeerId,
    producerId,
    kind: consumer.kind,
    rtpParameters: consumer.rtpParameters,
    type: consumer.type,
    producerPaused: consumer.producerPaused
  };
};
