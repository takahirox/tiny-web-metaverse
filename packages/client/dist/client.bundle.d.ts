// Generated by dts-bundle-generator v8.0.1

import { Component, IWorld } from 'bitecs';
import { Clock, Group, Object3D, Raycaster, Scene, WebGLRenderer } from 'three';

export declare const NULL_EID = 0;
export declare const INITIAL_VERSION = 0;
export declare const SystemOrder: Readonly<{
	Time: 0;
	EventHandling: 100;
	Setup: 200;
	BeforeMatricesUpdate: 300;
	MatricesUpdate: 400;
	BeforeRender: 500;
	Render: 600;
	AfterRender: 700;
	PostProcess: 800;
	TearDown: 900;
}>;
export type Prefab = (world: IWorld, params: object) => number;
export type PrefabMap = Map<string, Prefab>;
export type Serializer = (world: IWorld, eid: number) => any;
export type Deserializer = (world: IWorld, eid: number, data: any) => void;
export type NetworkDeserializer = (world: IWorld, eid: number, data: any) => void;
export type DiffChecker = (world: IWorld, eid: number, cache: any) => boolean;
export type Serializers = {
	deserializer: Deserializer;
	diffChecker: DiffChecker;
	networkDeserializer: NetworkDeserializer;
	serializer: Serializer;
};
export type SerializersMap = Map<string, Serializers>;
export type SerializerKeyMap = Map<Component, string>;
export type SystemParams = {
	prefabs: PrefabMap;
	serializerKeys: SerializerKeyMap;
	serializers: SerializersMap;
};
export type System = (world: IWorld, params: SystemParams) => void;
export declare const NETWORK_INTERVAL: number;
export declare const F32_EPSILON = 0.00001;
export declare class App {
	private systems;
	private systemParams;
	private prefabs;
	private serializers;
	private serializerKeys;
	private canvas;
	private world;
	private networkAdapter;
	private streamAdapter;
	readonly userId: string;
	constructor(params: {
		canvas?: HTMLCanvasElement;
		roomId: string;
		userId?: string;
	});
	private init;
	registerSystem(system: System, orderPriority?: number): void;
	deregisterSystem(system: System): void;
	getSystemOrderPriority(system: System): number;
	registerPrefab(key: string, prefab: Prefab): void;
	getPrefab(key: string): Prefab;
	registerSerializers(key: string, component: Component | null, serializers: Serializers): void;
	tick(): void;
	start(): void;
	getCanvas(): HTMLCanvasElement;
	getWorld(): IWorld;
}
export declare const Messages: Readonly<{
	ObjectDeselected: "object_deselected";
	ObjectSelected: "object_selected";
}>;
export declare const to2DMessageQueue: any[];
export declare const to3DMessageQueue: any[];
export declare const Avatar: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const AvatarMouseControls: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare class AvatarMouseControlsProxy {
	private static instance;
	private eid;
	private constructor();
	static get(eid: number): AvatarMouseControlsProxy;
	allocate(world: IWorld): void;
	free(world: IWorld): void;
	get enabled(): boolean;
	set enabled(value: boolean);
}
export declare const EntityObject3D: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare class EntityRootGroup extends Group {
	isEntityRootGroup: boolean;
	type: string;
	constructor();
}
export declare class EntityObject3DProxy {
	private static instance;
	private eid;
	private constructor();
	static get(eid: number): EntityObject3DProxy;
	allocate(world: IWorld): void;
	free(world: IWorld): void;
	addObject3D(world: IWorld, obj: Object3D): void;
	removeObject3D(world: IWorld, obj: Object3D): void;
	private swapRootObject3D;
	get root(): Object3D;
	private set root(value);
	private get objects();
	private get group();
}
export declare const Grabbable: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const Grabbed: import("bitecs").ComponentType<{
	distance: "f32";
}>;
export declare enum KeyEventType {
	Down = 0,
	Up = 1
}
export declare const KeyEventHandlerInit: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const KeyEventHandlerDestroy: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const KeyEventHandler: import("bitecs").ComponentType<import("bitecs").ISchema>;
export type KeyEventValue = {
	code: number;
	type: KeyEventType;
};
export declare const KeyEvent: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const KeyEventListener: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const KeyHold: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare class KeyEventHandlerProxy {
	private static instance;
	private eid;
	private constructor();
	static get(eid: number): KeyEventHandlerProxy;
	allocate(world: IWorld, keydownListener: (event: KeyboardEvent) => void, keyupListener: (event: KeyboardEvent) => void): void;
	free(world: IWorld): void;
	get keydownListener(): (event: KeyboardEvent) => void;
	get keyupListener(): (event: KeyboardEvent) => void;
}
export declare class KeyEventProxy {
	private static instance;
	private eid;
	private constructor();
	static get(eid: number): KeyEventProxy;
	add(world: IWorld, type: KeyEventType, code: number): void;
	free(world: IWorld): void;
	get events(): KeyEventValue[];
}
export declare const LinearMoveBackward: import("bitecs").ComponentType<{
	speed: "f32";
}>;
export declare const LinearMoveForward: import("bitecs").ComponentType<{
	speed: "f32";
}>;
export declare const LinearMoveLeft: import("bitecs").ComponentType<{
	speed: "f32";
}>;
export declare const LinearMoveRight: import("bitecs").ComponentType<{
	speed: "f32";
}>;
export declare const LinearTranslate: import("bitecs").ComponentType<{
	duration: "f32";
	targetX: "f32";
	targetY: "f32";
	targetZ: "f32";
}>;
export declare const LinearRotate: import("bitecs").ComponentType<{
	duration: "f32";
	targetX: "f32";
	targetY: "f32";
	targetZ: "f32";
	targetW: "f32";
}>;
export declare const LinearScale: import("bitecs").ComponentType<{
	duration: "f32";
	targetX: "f32";
	targetY: "f32";
	targetZ: "f32";
}>;
export declare const MediaDeviceManager: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const MicRequest: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const MicConnected: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare enum MouseButtonEventType {
	Down = 0,
	Up = 1
}
export declare enum MouseButtonType {
	Left = 0,
	Middle = 1,
	Right = 2
}
export declare const MouseButtonEventHandlerInit: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const MouseButtonEventHandlerDestroy: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const MouseButtonEventHandler: import("bitecs").ComponentType<import("bitecs").ISchema>;
export type MouseButtonEventValue = {
	button: MouseButtonType;
	x: number;
	y: number;
	type: MouseButtonEventType;
};
export declare const MouseButtonEvent: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const MouseButtonEventListener: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const MouseButtonHold: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const MouseMoveEventHandlerInit: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const MouseMoveEventHandlerDestroy: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const MouseMoveEventHandler: import("bitecs").ComponentType<import("bitecs").ISchema>;
export type MouseMoveEventValue = {
	x: number;
	y: number;
};
export declare const MouseMoveEvent: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const MouseMoveEventListener: import("bitecs").ComponentType<import("bitecs").ISchema>;
export type MousePositionValue = {
	x: number;
	y: number;
};
export declare const MousePosition: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const PreviousMousePosition: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare class MouseButtonEventHandlerInitProxy {
	private static instance;
	private eid;
	private constructor();
	static get(eid: number): MouseButtonEventHandlerInitProxy;
	allocate(world: IWorld, target: HTMLElement): void;
	free(world: IWorld): void;
	get target(): HTMLElement;
}
export declare class MouseButtonEventHandlerProxy {
	private static instance;
	private eid;
	private constructor();
	static get(eid: number): MouseButtonEventHandlerProxy;
	allocate(world: IWorld, target: HTMLElement, mousedownListener: (event: MouseEvent) => void, mouseupListener: (event: MouseEvent) => void, contextmenuListener: (event: MouseEvent) => void): void;
	free(world: IWorld): void;
	get target(): HTMLElement;
	get mousedownListener(): (event: MouseEvent) => void;
	get mouseupListener(): (event: MouseEvent) => void;
	get contextmenuListener(): (event: MouseEvent) => void;
}
export declare class MouseButtonEventProxy {
	private static instance;
	private eid;
	private constructor();
	static get(eid: number): MouseButtonEventProxy;
	add(world: IWorld, type: MouseButtonEventType, button: MouseButtonType, x: number, y: number): void;
	free(world: IWorld): void;
	get events(): MouseButtonEventValue[];
}
export declare class MouseMoveEventHandlerInitProxy {
	private static instance;
	private eid;
	private constructor();
	static get(eid: number): MouseMoveEventHandlerInitProxy;
	allocate(world: IWorld, target: HTMLElement): void;
	free(world: IWorld): void;
	get target(): HTMLElement;
}
export declare class MouseMoveEventHandlerProxy {
	private static instance;
	private eid;
	private constructor();
	static get(eid: number): MouseMoveEventHandlerProxy;
	allocate(world: IWorld, target: HTMLElement, listener: (event: MouseEvent) => void): void;
	free(world: IWorld): void;
	get listener(): (event: MouseEvent) => void;
	get target(): HTMLElement;
}
export declare class MouseMoveEventProxy {
	private static instance;
	private eid;
	private constructor();
	static get(eid: number): MouseMoveEventProxy;
	add(world: IWorld, x: number, y: number): void;
	free(world: IWorld): void;
	get events(): MouseMoveEventValue[];
}
export declare class MousePositionProxy {
	private static instance;
	private eid;
	private constructor();
	static get(eid: number): MousePositionProxy;
	allocate(world: IWorld): void;
	free(world: IWorld): void;
	update(x: number, y: number): void;
	get x(): number;
	get y(): number;
}
export declare class PreviousMousePositionProxy {
	private static instance;
	private eid;
	private constructor();
	static get(eid: number): PreviousMousePositionProxy;
	allocate(world: IWorld): void;
	free(world: IWorld): void;
	update(x: number, y: number): void;
	get x(): number;
	get y(): number;
}
// Generated by dts-bundle-generator v8.0.1
export type Callback = (payload?: any) => void;
declare class StateAdapter {
	private channel;
	private eventListenerMap;
	readonly userId: string;
	constructor(params: {
		roomId: string;
		url?: string;
		userId: string;
	});
	addEventListener(name: string, callback: Callback): void;
	removeEventListener(name: string): void;
	push(name: string, data: any): void;
}
export declare enum NetworkMessageType {
	AddComponent = "add_component",
	CreateEntity = "create_entity",
	RemoveEntity = "remove_entity",
	RemoveComponent = "remove_component",
	TextMessage = "text_message",
	UpdateComponent = "update_component",
	UserJoined = "user_joined",
	UserLeft = "user_left",
	UserList = "user_list"
}
export declare enum NetworkedType {
	Local = "local",
	Remote = "remote",
	Shared = "shared"
}
export type CacheData = any;
export type NetworkedComponent = {
	cache: CacheData;
	owner: string;
	version: number;
};
export declare const Networked: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare class NetworkedProxy {
	private static instance;
	private eid;
	private map;
	private constructor();
	static get(eid: number): NetworkedProxy;
	allocate(world: IWorld, networkId: string, type: NetworkedType, creator: string, prefabName: string, prefabParams: any): void;
	free(world: IWorld): void;
	hasNetworkedComponent(key: string): boolean;
	initNetworkedComponent(key: string, cache: CacheData, owner: string, version: number): void;
	updateNetworkedComponent(key: string, cache: CacheData, owner: string, version: number): void;
	getNetworkedComponent(key: string): NetworkedComponent;
	removeNetworkedComponent(key: string): void;
	get creator(): string;
	get networkId(): string;
	get prefabName(): string;
	get prefabParams(): any;
	get type(): NetworkedType;
}
export declare const NetworkedInit: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare class NetworkedInitProxy {
	private static instance;
	private eid;
	private map;
	private constructor();
	static get(eid: number): NetworkedInitProxy;
	allocate(world: IWorld, networkId: string, prefabName: string, prefabParams: any): void;
	free(world: IWorld): void;
	get networkId(): string;
	get prefabName(): string;
	get prefabParams(): string;
}
export declare const Local: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const Remote: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const Shared: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const NetworkedPosition: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const NetworkedQuaternion: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const NetworkedScale: import("bitecs").ComponentType<import("bitecs").ISchema>;
export type NetworkEventValue = {
	data: any;
	type: NetworkMessageType;
};
export declare const NetworkEvent: import("bitecs").ComponentType<import("bitecs").ISchema>;
export type StateClientValue = StateAdapter;
export declare const StateClient: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const NetworkEventReceiver: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const NetworkEventReceiverInit: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const NetworkEventReceiverDestroy: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const TextMessageNetworkEventListener: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const UserNetworkEventListener: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const EntityNetworkEventListener: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const ComponentNetworkEventListener: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const NetworkEventSender: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare class StateClientProxy {
	private static instance;
	private eid;
	private constructor();
	static get(eid: number): StateClientProxy;
	allocate(world: IWorld, adapter: StateClientValue): void;
	free(world: IWorld): void;
	get adapter(): StateClientValue;
}
export declare class NetworkEventProxy {
	private static instance;
	private eid;
	private constructor();
	static get(eid: number): NetworkEventProxy;
	add(world: IWorld, type: NetworkMessageType, data: any): void;
	free(world: IWorld): void;
	get events(): NetworkEventValue[];
}
export declare class NetworkEventSenderProxy {
	private static instance;
	private eid;
	private constructor();
	static get(eid: number): NetworkEventSenderProxy;
	allocate(world: IWorld): void;
	free(world: IWorld): void;
	get lastSendTime(): number;
	set lastSendTime(lastSendTime: number);
}
export declare const NetworkedEntityManager: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare class NetworkedEntityManagerProxy {
	private static instance;
	private eid;
	private map;
	private constructor();
	static get(eid: number): NetworkedEntityManagerProxy;
	allocate(world: IWorld): void;
	free(world: IWorld): void;
	add(eid: number, networkId: string, userId: string): void;
	remove(networkId: string): void;
	getNetworkId(eid: number): string;
	getNetworkIdsByUserId(userId: string): string[];
	clearNetworkIdsByUserId(userId: string): void;
	getEid(networkId: string): number;
	deleted(networkId: string): boolean;
}
export declare const RaycasterTag: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const Raycastable: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const Raycasted: import("bitecs").ComponentType<{
	distance: "f32";
}>;
export declare class RaycasterProxy {
	private static instance;
	private eid;
	private constructor();
	static get(eid: number): RaycasterProxy;
	allocate(world: IWorld, raycaster: Raycaster): void;
	free(world: IWorld): void;
	get raycaster(): Raycaster;
}
export type RendererParams = {
	height?: number;
	canvas?: HTMLCanvasElement;
	pixelRatio?: number;
	width?: number;
};
export declare const RendererInit: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const RendererDestroy: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const Renderer: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare class RendererInitProxy {
	private static instance;
	private eid;
	private constructor();
	static get(eid: number): RendererInitProxy;
	allocate(world: IWorld, params?: RendererParams): void;
	free(world: IWorld): void;
	get height(): number;
	get canvas(): HTMLCanvasElement;
	get pixelRatio(): number;
	get width(): number;
}
export declare class RendererProxy {
	private static instance;
	private eid;
	private constructor();
	static get(eid: number): RendererProxy;
	allocate(world: IWorld, renderer: WebGLRenderer): void;
	free(world: IWorld): void;
	get renderer(): WebGLRenderer;
}
export type SceneParams = {
	backgroundColor?: number;
};
export declare const SceneInit: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const SceneTag: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const InScene: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare class SceneInitProxy {
	private static instance;
	private eid;
	constructor();
	static get(eid: number): SceneInitProxy;
	allocate(world: IWorld, params?: SceneParams): void;
	free(world: IWorld): void;
	get backgroundColor(): number;
}
export declare class SceneProxy {
	private static instance;
	private eid;
	private constructor();
	static get(eid: number): SceneProxy;
	allocate(world: IWorld, scene: Scene): void;
	free(world: IWorld): void;
	get scene(): Scene;
}
export declare const Selectable: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const Selected: import("bitecs").ComponentType<import("bitecs").ISchema>;
declare class StreamAdapter {
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
export declare enum StreamMessageType {
	Connected = "connected",
	Joined = "joined",
	Disconnected = "disconnected",
	ExitedPeer = "exitedPeer",
	JoinedPeer = "joinedPeer",
	LeftPeer = "leftPeer",
	NewConsumer = "newConsumer",
	NewPeer = "newPeer"
}
export declare const StreamEvent: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const StreamClient: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const StreamRemotePeerRegister: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const StreamNotConnected: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const StreamConnecting: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const StreamInLobby: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const StreamJoining: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const StreamInRoom: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const StreamLeaving: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const StreamConnectRequest: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const StreamJoinRequest: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const StreamLeaveRequest: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const StreamEventReceiver: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const StreamEventReceiverInit: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const StreamEventReceiverDestroy: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const ConnectedStreamEventListener: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const DisconnectedStreamEventListener: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const JoinedStreamEventListener: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const ExitedPeerStreamEventListener: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const JoinedPeerStreamEventListener: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const LeftPeerStreamEventListener: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const NewConsumerStreamEventListener: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const NewPeerStreamEventListener: import("bitecs").ComponentType<import("bitecs").ISchema>;
export type StreamClientValue = StreamAdapter;
export declare class StreamClientProxy {
	private static instance;
	private eid;
	private map;
	private constructor();
	static get(eid: number): StreamClientProxy;
	allocate(world: IWorld, adapter: StreamClientValue): void;
	free(world: IWorld): void;
	get adapter(): StreamClientValue;
}
export type StreamEventValue = {
	data: any;
	type: StreamMessageType;
};
export declare class StreamEventProxy {
	private static instance;
	private eid;
	private map;
	private constructor();
	static get(eid: number): StreamEventProxy;
	add(world: IWorld, type: StreamMessageType, data: any): void;
	free(world: IWorld): void;
	get events(): StreamEventValue[];
}
export type RemoteStreamPeerValue = {
	audio?: HTMLAudioElement;
	id: string;
	joined: boolean;
};
export type StreamRemotePeersValue = Map<string, RemoteStreamPeerValue>;
export declare const StreamRemotePeers: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare class StreamRemotePeersProxy {
	private static instance;
	private eid;
	private map;
	private constructor();
	static get(eid: number): StreamRemotePeersProxy;
	allocate(world: IWorld): void;
	free(world: IWorld): void;
	remote(id: string): void;
	get peers(): StreamRemotePeersValue;
}
export declare const TimeInit: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const Time: import("bitecs").ComponentType<{
	delta: "f32";
	elapsed: "f32";
}>;
export declare class TimeProxy {
	private static instance;
	private eid;
	constructor();
	static get(eid: number): TimeProxy;
	allocate(world: IWorld, clock: Clock, delta: number, elapsed: number): void;
	free(world: IWorld): void;
	get clock(): Clock;
	get delta(): number;
	set delta(delta: number);
	get elapsed(): number;
	set elapsed(elapsed: number);
}
export declare const TransformUpdated: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const WindowResizeEventHandlerInit: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const WindowResizeEventHandlerDestroy: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const WindowResizeEventHandler: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const WindowResizeEvent: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const WindowResizeEventListener: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare const WindowSize: import("bitecs").ComponentType<import("bitecs").ISchema>;
export declare class WindowResizeEventHandlerProxy {
	private static instance;
	private eid;
	private constructor();
	static get(eid: number): WindowResizeEventHandlerProxy;
	allocate(world: IWorld, listener: () => void): void;
	free(world: IWorld): void;
	get listener(): () => void;
}
export type SerializedPosition = [
	x: number,
	y: number,
	z: number
];
export type SerializedQuaternion = [
	x: number,
	y: number,
	z: number,
	w: number
];
export type SerializedScale = [
	x: number,
	y: number,
	z: number
];
export declare const positionSerializers: {
	deserializer: (world: IWorld, eid: number, data: SerializedPosition) => void;
	diffChecker: (world: IWorld, eid: number, cache: SerializedPosition) => boolean;
	networkDeserializer: (world: IWorld, eid: number, data: SerializedPosition) => void;
	serializer: (world: IWorld, eid: number) => SerializedPosition;
};
export declare const quaternionSerializers: {
	deserializer: (world: IWorld, eid: number, data: SerializedQuaternion) => void;
	diffChecker: (world: IWorld, eid: number, cache: SerializedQuaternion) => boolean;
	networkDeserializer: (world: IWorld, eid: number, data: SerializedQuaternion) => void;
	serializer: (world: IWorld, eid: number) => SerializedQuaternion;
};
export declare const scaleSerializers: {
	deserializer: (world: IWorld, eid: number, data: SerializedScale) => void;
	diffChecker: (world: IWorld, eid: number, cache: SerializedScale) => boolean;
	networkDeserializer: (world: IWorld, eid: number, data: SerializedScale) => void;
	serializer: (world: IWorld, eid: number) => SerializedScale;
};
export declare const avatarKeyControlsSystem: (world: IWorld) => void;
export declare const avatarMouseControlsSystem: (world: IWorld) => void;
export declare const fpsCameraSystem: (world: IWorld) => void;
export declare const grabSystem: (world: IWorld) => void;
export declare const grabbedObjectsMouseTrackSystem: (world: IWorld) => void;
export declare const keyEventHandleSystem: (world: IWorld) => void;
export declare const keyEventClearSystem: (world: IWorld) => void;
export declare const linearMoveSystem: (world: IWorld) => void;
export declare const linearTransformSystem: (world: IWorld) => void;
export declare const micRequestSystem: (world: IWorld) => void;
export declare const mouseButtonEventHandleSystem: (world: IWorld) => void;
export declare const mouseButtonEventClearSystem: (world: IWorld) => void;
export declare const mouseMoveEventHandleSystem: (world: IWorld) => void;
export declare const mouseMoveEventClearSystem: (world: IWorld) => void;
export declare const mousePositionTrackSystem: (world: IWorld) => void;
export declare const mouseRaycastSystem: (world: IWorld) => void;
export declare const mouseSelectSystem: (world: IWorld) => void;
export declare const networkedSystem: (world: IWorld) => void;
export declare const networkedEntitySystem: (world: IWorld, { prefabs, serializers }: SystemParams) => void;
export declare const networkEventHandleSystem: (world: IWorld) => void;
export declare const networkEventClearSystem: (world: IWorld) => void;
export declare const networkSendSystem: (world: IWorld, { serializerKeys, serializers }: SystemParams) => void;
export declare const perspectiveCameraSystem: (world: IWorld) => void;
export declare const clearRaycastedSystem: (world: IWorld) => void;
export declare const renderSystem: (world: IWorld) => void;
export declare const rendererSystem: (world: IWorld) => void;
export declare const sceneSystem: (world: IWorld) => void;
export declare const timeSystem: (world: IWorld) => void;
export declare const clearTransformUpdatedSystem: (world: IWorld) => void;
export declare const updateMatricesSystem: (world: IWorld) => void;
export declare const windowResizeEventHandleSystem: (world: IWorld) => void;
export declare const windowResizeEventClearSystem: (world: IWorld) => void;
export declare const createNetworkedEntity: (world: IWorld, app: App, type: NetworkedType.Local | NetworkedType.Shared, prefabName: string, prefabParams?: any) => number;

export {};
