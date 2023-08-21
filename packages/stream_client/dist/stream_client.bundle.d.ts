// Generated by dts-bundle-generator v8.0.1

export declare class StreamAdapter {
	private device;
	private socket;
	private connected;
	private joined;
	private recvTransport;
	private sendTransport;
	private connectedEventListener;
	private joinedEventListener;
	private disconnectedEventListener;
	private newPeerEventListener;
	private joinedPeerEventListener;
	private leftPeerEventListener;
	private exitedPeerEventListener;
	private newConsumerEventListener;
	private consumerInfoQueue;
	constructor(serverUrl?: string);
	connect(roomId: string, peerId: string): Promise<{
		id: string;
		joined: boolean;
	}[]>;
	on(eventName: string, callback: (...args: any[]) => void): void;
	off(eventName: string): void;
	private handleConsumerInfos;
	exit(): Promise<void>;
	join(): Promise<void>;
	leave(): Promise<void>;
	private createSendTransport;
	private createRecvTransport;
	produce(track: MediaStreamTrack): Promise<void>;
}

export {};
