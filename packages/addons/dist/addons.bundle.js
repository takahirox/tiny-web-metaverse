/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/systems/gltf_mixer_animation.ts":
/*!*********************************************!*\
  !*** ./src/systems/gltf_mixer_animation.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gltfMixerAnimationSystem: () => (/* binding */ gltfMixerAnimationSystem)
/* harmony export */ });
/* harmony import */ var bitecs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bitecs */ "../../node_modules/bitecs/dist/index.mjs");
/* harmony import */ var _tiny_web_metaverse_client_src__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tiny-web-metaverse/client/src */ "../client/src/components/gltf.ts");
/* harmony import */ var _tiny_web_metaverse_client_src__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tiny-web-metaverse/client/src */ "../client/src/components/mixer_animation.ts");
/* harmony import */ var _tiny_web_metaverse_client_src__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tiny-web-metaverse/client/src */ "../client/src/components/network.ts");
/* harmony import */ var _tiny_web_metaverse_client_src__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @tiny-web-metaverse/client/src */ "../client/src/components/user_id.ts");
/* harmony import */ var _tiny_web_metaverse_client_src__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @tiny-web-metaverse/client/src */ "../client/src/utils/bitecs.ts");
/* harmony import */ var _tiny_web_metaverse_client_src__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @tiny-web-metaverse/client/src */ "../client/src/utils/mixer_animation.ts");


const gltfEnterQuery = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.enterQuery)((0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineQuery)([_tiny_web_metaverse_client_src__WEBPACK_IMPORTED_MODULE_1__.GltfRoot, _tiny_web_metaverse_client_src__WEBPACK_IMPORTED_MODULE_2__.MixerAnimation, (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.Not)(_tiny_web_metaverse_client_src__WEBPACK_IMPORTED_MODULE_3__.Remote)]));
const userQuery = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineQuery)([_tiny_web_metaverse_client_src__WEBPACK_IMPORTED_MODULE_4__.UserId]);
const gltfMixerAnimationSystem = (world) => {
    gltfEnterQuery(world).forEach(eid => {
        if ((0,_tiny_web_metaverse_client_src__WEBPACK_IMPORTED_MODULE_5__.hasComponents)(world, [_tiny_web_metaverse_client_src__WEBPACK_IMPORTED_MODULE_3__.Networked, _tiny_web_metaverse_client_src__WEBPACK_IMPORTED_MODULE_3__.NetworkedMixerAnimation, _tiny_web_metaverse_client_src__WEBPACK_IMPORTED_MODULE_3__.Shared], eid)) {
            // Assumes always single user id entity exists
            if (_tiny_web_metaverse_client_src__WEBPACK_IMPORTED_MODULE_3__.NetworkedProxy.get(eid).creator !== _tiny_web_metaverse_client_src__WEBPACK_IMPORTED_MODULE_4__.UserIdProxy.get(userQuery(world)[0]).userId) {
                console.log(eid);
                return;
            }
        }
        const root = _tiny_web_metaverse_client_src__WEBPACK_IMPORTED_MODULE_1__.GltfRootProxy.get(eid).root;
        if (root.animations.length === 0) {
            return;
        }
        const mixer = _tiny_web_metaverse_client_src__WEBPACK_IMPORTED_MODULE_2__.MixerAnimationProxy.get(eid).mixer;
        // TODO: What if asset has multiple animations?
        const action = mixer.clipAction(root.animations[0], root);
        action.play();
        (0,_tiny_web_metaverse_client_src__WEBPACK_IMPORTED_MODULE_6__.addAnimation)(world, eid, action);
    });
};


/***/ }),

/***/ "../client/src/common.ts":
/*!*******************************!*\
  !*** ../client/src/common.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   F32_EPSILON: () => (/* binding */ F32_EPSILON),
/* harmony export */   INITIAL_VERSION: () => (/* binding */ INITIAL_VERSION),
/* harmony export */   NETWORK_INTERVAL: () => (/* binding */ NETWORK_INTERVAL),
/* harmony export */   NULL_EID: () => (/* binding */ NULL_EID),
/* harmony export */   SystemOrder: () => (/* binding */ SystemOrder),
/* harmony export */   TIME_EPSILON: () => (/* binding */ TIME_EPSILON)
/* harmony export */ });
const NULL_EID = 0;
//
const INITIAL_VERSION = 0;
const SystemOrder = Object.freeze({
    Time: 0,
    EventHandling: 100,
    Setup: 200,
    BeforeMatricesUpdate: 300,
    MatricesUpdate: 400,
    BeforeRender: 500,
    Render: 600,
    AfterRender: 700,
    PostProcess: 800,
    TearDown: 900
});
// TODO: Configurable
const NETWORK_INTERVAL = 1.0 / 60 * 5;
// TODO: More accurate number
// TODO: Configurable?
const F32_EPSILON = 0.00001;
// In the second.
// TODO: This is very arbitrary number. Think of better number.
// TODO: Configurable?
const TIME_EPSILON = 2.0;


/***/ }),

/***/ "../client/src/components/gltf.ts":
/*!****************************************!*\
  !*** ../client/src/components/gltf.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GltfAssetLoader: () => (/* binding */ GltfAssetLoader),
/* harmony export */   GltfAssetLoaderProxy: () => (/* binding */ GltfAssetLoaderProxy),
/* harmony export */   GltfRoot: () => (/* binding */ GltfRoot),
/* harmony export */   GltfRootProxy: () => (/* binding */ GltfRootProxy),
/* harmony export */   GltfSceneLoader: () => (/* binding */ GltfSceneLoader),
/* harmony export */   GltfSceneLoaderProxy: () => (/* binding */ GltfSceneLoaderProxy)
/* harmony export */ });
/* harmony import */ var bitecs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bitecs */ "../../node_modules/bitecs/dist/index.mjs");
/* harmony import */ var _common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common */ "../client/src/common.ts");


const GltfRoot = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();
class GltfRootProxy {
    constructor() {
        this.eid = _common__WEBPACK_IMPORTED_MODULE_1__.NULL_EID;
        this.map = new Map();
    }
    static get(eid) {
        GltfRootProxy.instance.eid = eid;
        return GltfRootProxy.instance;
    }
    allocate(root) {
        this.map.set(this.eid, root);
    }
    free() {
        this.map.delete(this.eid);
    }
    get root() {
        return this.map.get(this.eid);
    }
}
GltfRootProxy.instance = new GltfRootProxy();
const GltfAssetLoader = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();
class GltfAssetLoaderProxy {
    constructor() {
        this.eid = _common__WEBPACK_IMPORTED_MODULE_1__.NULL_EID;
        this.map = new Map();
    }
    static get(eid) {
        GltfAssetLoaderProxy.instance.eid = eid;
        return GltfAssetLoaderProxy.instance;
    }
    allocate(url) {
        this.map.set(this.eid, url);
    }
    free() {
        this.map.delete(this.eid);
    }
    get url() {
        return this.map.get(this.eid);
    }
}
GltfAssetLoaderProxy.instance = new GltfAssetLoaderProxy();
const GltfSceneLoader = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();
class GltfSceneLoaderProxy {
    constructor() {
        this.eid = _common__WEBPACK_IMPORTED_MODULE_1__.NULL_EID;
        this.map = new Map();
    }
    static get(eid) {
        GltfSceneLoaderProxy.instance.eid = eid;
        return GltfSceneLoaderProxy.instance;
    }
    allocate(url) {
        this.map.set(this.eid, url);
    }
    free() {
        this.map.delete(this.eid);
    }
    get url() {
        return this.map.get(this.eid);
    }
}
GltfSceneLoaderProxy.instance = new GltfSceneLoaderProxy();


/***/ }),

/***/ "../client/src/components/mixer_animation.ts":
/*!***************************************************!*\
  !*** ../client/src/components/mixer_animation.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ActiveAnimations: () => (/* binding */ ActiveAnimations),
/* harmony export */   ActiveAnimationsProxy: () => (/* binding */ ActiveAnimationsProxy),
/* harmony export */   ActiveAnimationsUpdated: () => (/* binding */ ActiveAnimationsUpdated),
/* harmony export */   MixerAnimation: () => (/* binding */ MixerAnimation),
/* harmony export */   MixerAnimationProxy: () => (/* binding */ MixerAnimationProxy)
/* harmony export */ });
/* harmony import */ var bitecs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bitecs */ "../../node_modules/bitecs/dist/index.mjs");
/* harmony import */ var _common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common */ "../client/src/common.ts");


const MixerAnimation = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();
class MixerAnimationProxy {
    constructor() {
        this.eid = _common__WEBPACK_IMPORTED_MODULE_1__.NULL_EID;
        this.map = new Map();
    }
    static get(eid) {
        MixerAnimationProxy.instance.eid = eid;
        return MixerAnimationProxy.instance;
    }
    allocate(mixer) {
        this.map.set(this.eid, mixer);
    }
    free() {
        this.map.delete(this.eid);
    }
    get mixer() {
        return this.map.get(this.eid);
    }
}
MixerAnimationProxy.instance = new MixerAnimationProxy();
const ActiveAnimations = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();
class ActiveAnimationsProxy {
    constructor() {
        this.eid = _common__WEBPACK_IMPORTED_MODULE_1__.NULL_EID;
        this.map = new Map();
    }
    static get(eid) {
        ActiveAnimationsProxy.instance.eid = eid;
        return ActiveAnimationsProxy.instance;
    }
    allocate() {
        this.map.set(this.eid, []);
    }
    add(action) {
        this.map.get(this.eid).push(action);
    }
    remove(action) {
        const actions = this.actions;
        const index = actions.indexOf(action);
        if (index === -1) {
            return;
        }
        actions.splice(index, 1);
    }
    free() {
        this.map.delete(this.eid);
    }
    get actions() {
        return this.map.get(this.eid);
    }
}
ActiveAnimationsProxy.instance = new ActiveAnimationsProxy();
const ActiveAnimationsUpdated = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();


/***/ }),

/***/ "../client/src/components/network.ts":
/*!*******************************************!*\
  !*** ../client/src/components/network.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ComponentNetworkEventListener: () => (/* binding */ ComponentNetworkEventListener),
/* harmony export */   EntityNetworkEventListener: () => (/* binding */ EntityNetworkEventListener),
/* harmony export */   Local: () => (/* binding */ Local),
/* harmony export */   NetworkEvent: () => (/* binding */ NetworkEvent),
/* harmony export */   NetworkEventProxy: () => (/* binding */ NetworkEventProxy),
/* harmony export */   NetworkEventReceiver: () => (/* binding */ NetworkEventReceiver),
/* harmony export */   NetworkEventReceiverReady: () => (/* binding */ NetworkEventReceiverReady),
/* harmony export */   NetworkEventSender: () => (/* binding */ NetworkEventSender),
/* harmony export */   NetworkMessageType: () => (/* binding */ NetworkMessageType),
/* harmony export */   Networked: () => (/* binding */ Networked),
/* harmony export */   NetworkedEntityManager: () => (/* binding */ NetworkedEntityManager),
/* harmony export */   NetworkedEntityManagerProxy: () => (/* binding */ NetworkedEntityManagerProxy),
/* harmony export */   NetworkedMixerAnimation: () => (/* binding */ NetworkedMixerAnimation),
/* harmony export */   NetworkedPosition: () => (/* binding */ NetworkedPosition),
/* harmony export */   NetworkedProxy: () => (/* binding */ NetworkedProxy),
/* harmony export */   NetworkedQuaternion: () => (/* binding */ NetworkedQuaternion),
/* harmony export */   NetworkedScale: () => (/* binding */ NetworkedScale),
/* harmony export */   NetworkedType: () => (/* binding */ NetworkedType),
/* harmony export */   Remote: () => (/* binding */ Remote),
/* harmony export */   Shared: () => (/* binding */ Shared),
/* harmony export */   StateClient: () => (/* binding */ StateClient),
/* harmony export */   StateClientProxy: () => (/* binding */ StateClientProxy),
/* harmony export */   TextMessageNetworkEventListener: () => (/* binding */ TextMessageNetworkEventListener),
/* harmony export */   UserNetworkEventListener: () => (/* binding */ UserNetworkEventListener)
/* harmony export */ });
/* harmony import */ var bitecs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bitecs */ "../../node_modules/bitecs/dist/index.mjs");
/* harmony import */ var _common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common */ "../client/src/common.ts");


var NetworkMessageType;
(function (NetworkMessageType) {
    NetworkMessageType["AddComponent"] = "add_component";
    NetworkMessageType["CreateEntity"] = "create_entity";
    NetworkMessageType["RemoveEntity"] = "remove_entity";
    NetworkMessageType["RemoveComponent"] = "remove_component";
    NetworkMessageType["TextMessage"] = "text_message";
    NetworkMessageType["UpdateComponent"] = "update_component";
    NetworkMessageType["UserJoined"] = "user_joined";
    NetworkMessageType["UserLeft"] = "user_left";
    NetworkMessageType["UserList"] = "user_list";
})(NetworkMessageType || (NetworkMessageType = {}));
;
var NetworkedType;
(function (NetworkedType) {
    NetworkedType["Local"] = "local";
    NetworkedType["Remote"] = "remote";
    NetworkedType["Shared"] = "shared";
})(NetworkedType || (NetworkedType = {}));
;
const Local = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();
const Remote = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();
const Shared = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();
const Networked = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();
class NetworkedProxy {
    constructor() {
        this.eid = _common__WEBPACK_IMPORTED_MODULE_1__.NULL_EID;
        this.map = new Map();
    }
    static get(eid) {
        NetworkedProxy.instance.eid = eid;
        return NetworkedProxy.instance;
    }
    // TODO: Avoid any
    allocate(networkId, type, creator, prefabName, prefabParams) {
        this.map.set(this.eid, {
            components: new Map(),
            creator,
            networkId,
            prefabName,
            prefabParams,
            type
        });
    }
    free() {
        this.map.delete(this.eid);
    }
    hasNetworkedComponent(key) {
        return this.map.get(this.eid).components.has(key);
    }
    initNetworkedComponent(key, cache, owner, updatedAt, version) {
        this.map.get(this.eid).components.set(key, {
            cache,
            owner,
            updatedAt,
            version
        });
    }
    updateNetworkedComponent(key, cache, owner, updatedAt, version) {
        const component = this.map.get(this.eid).components.get(key);
        component.cache = cache;
        component.owner = owner;
        component.updatedAt = updatedAt;
        component.version = version;
    }
    getNetworkedComponent(key) {
        return this.map.get(this.eid).components.get(key);
    }
    removeNetworkedComponent(key) {
        this.map.get(this.eid).components.delete(key);
    }
    get creator() {
        return this.map.get(this.eid).creator;
    }
    get networkId() {
        return this.map.get(this.eid).networkId;
    }
    get prefabName() {
        return this.map.get(this.eid).prefabName;
    }
    get prefabParams() {
        return this.map.get(this.eid).prefabParams;
    }
    get type() {
        return this.map.get(this.eid).type;
    }
}
NetworkedProxy.instance = new NetworkedProxy();
const NetworkedEntityManager = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();
class NetworkedEntityManagerProxy {
    constructor() {
        this.eid = _common__WEBPACK_IMPORTED_MODULE_1__.NULL_EID;
        this.map = new Map();
    }
    static get(eid) {
        NetworkedEntityManagerProxy.instance.eid = eid;
        return NetworkedEntityManagerProxy.instance;
    }
    allocate() {
        this.map.set(this.eid, {
            deleted: new Set(),
            eidToNetworkIdMap: new Map(),
            networkIdToEidMap: new Map(),
            networkIdToUserIdMap: new Map(),
            userIdToNetworkIdsMap: new Map()
        });
    }
    free() {
        this.map.delete(this.eid);
    }
    add(eid, networkId, userId) {
        this.map.get(this.eid).eidToNetworkIdMap.set(eid, networkId);
        this.map.get(this.eid).networkIdToEidMap.set(networkId, eid);
        this.map.get(this.eid).networkIdToUserIdMap.set(networkId, userId);
        if (!this.map.get(this.eid).userIdToNetworkIdsMap.has(userId)) {
            this.map.get(this.eid).userIdToNetworkIdsMap.set(userId, []);
        }
        this.map.get(this.eid).userIdToNetworkIdsMap.get(userId).push(networkId);
    }
    remove(networkId) {
        const eid = this.map.get(this.eid).networkIdToEidMap.get(networkId);
        this.map.get(this.eid).networkIdToEidMap.delete(networkId);
        this.map.get(this.eid).eidToNetworkIdMap.delete(eid);
        const userId = this.map.get(this.eid).networkIdToUserIdMap.get(networkId);
        this.map.get(this.eid).networkIdToUserIdMap.delete(networkId);
        this.map.get(this.eid).userIdToNetworkIdsMap.get(userId).splice(this.map.get(this.eid).userIdToNetworkIdsMap.get(userId).indexOf(networkId), 1);
        this.map.get(this.eid).deleted.add(networkId);
    }
    getNetworkId(eid) {
        return this.map.get(this.eid).eidToNetworkIdMap.get(eid);
    }
    getNetworkIdsByUserId(userId) {
        return this.map.get(this.eid).userIdToNetworkIdsMap.get(userId);
    }
    clearNetworkIdsByUserId(userId) {
        while (this.getNetworkIdsByUserId(userId).length > 0) {
            this.remove(this.getNetworkIdsByUserId(userId)[0]);
        }
    }
    getEid(networkId) {
        return this.map.get(this.eid).networkIdToEidMap.get(networkId);
    }
    deleted(networkId) {
        return this.map.get(this.eid).deleted.has(networkId);
    }
}
NetworkedEntityManagerProxy.instance = new NetworkedEntityManagerProxy();
const StateClient = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();
class StateClientProxy {
    constructor() {
        this.eid = _common__WEBPACK_IMPORTED_MODULE_1__.NULL_EID;
        this.map = new Map();
    }
    static get(eid) {
        StateClientProxy.instance.eid = eid;
        return StateClientProxy.instance;
    }
    allocate(adapter) {
        this.map.set(this.eid, adapter);
    }
    free() {
        this.map.delete(this.eid);
    }
    get adapter() {
        return this.map.get(this.eid);
    }
}
StateClientProxy.instance = new StateClientProxy();
const NetworkEvent = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();
class NetworkEventProxy {
    constructor() {
        this.eid = _common__WEBPACK_IMPORTED_MODULE_1__.NULL_EID;
        this.map = new Map();
    }
    static get(eid) {
        NetworkEventProxy.instance.eid = eid;
        return NetworkEventProxy.instance;
    }
    allocate() {
        this.map.set(this.eid, []);
    }
    add(type, data) {
        this.map.get(this.eid).push({ data, type });
    }
    free() {
        this.map.delete(this.eid);
    }
    get events() {
        return this.map.get(this.eid);
    }
}
NetworkEventProxy.instance = new NetworkEventProxy();
const NetworkEventReceiver = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();
const NetworkEventReceiverReady = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();
const TextMessageNetworkEventListener = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();
const UserNetworkEventListener = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();
const EntityNetworkEventListener = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();
const ComponentNetworkEventListener = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();
const NetworkEventSender = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)({
    lastSendTime: bitecs__WEBPACK_IMPORTED_MODULE_0__.Types.f32
});
const NetworkedPosition = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();
const NetworkedQuaternion = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();
const NetworkedScale = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();
const NetworkedMixerAnimation = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();


/***/ }),

/***/ "../client/src/components/user_id.ts":
/*!*******************************************!*\
  !*** ../client/src/components/user_id.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UserId: () => (/* binding */ UserId),
/* harmony export */   UserIdProxy: () => (/* binding */ UserIdProxy)
/* harmony export */ });
/* harmony import */ var bitecs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bitecs */ "../../node_modules/bitecs/dist/index.mjs");
/* harmony import */ var _common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common */ "../client/src/common.ts");


const UserId = (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.defineComponent)();
class UserIdProxy {
    constructor() {
        this.eid = _common__WEBPACK_IMPORTED_MODULE_1__.NULL_EID;
        this.map = new Map();
    }
    static get(eid) {
        UserIdProxy.instance.eid = eid;
        return UserIdProxy.instance;
    }
    allocate(userId) {
        this.map.set(this.eid, userId);
    }
    free() {
        this.map.delete(this.eid);
    }
    get userId() {
        return this.map.get(this.eid);
    }
}
UserIdProxy.instance = new UserIdProxy();


/***/ }),

/***/ "../client/src/utils/bitecs.ts":
/*!*************************************!*\
  !*** ../client/src/utils/bitecs.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hasComponents: () => (/* binding */ hasComponents),
/* harmony export */   removeEntityIfNoComponent: () => (/* binding */ removeEntityIfNoComponent)
/* harmony export */ });
/* harmony import */ var bitecs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bitecs */ "../../node_modules/bitecs/dist/index.mjs");

const removeEntityIfNoComponent = (world, eid) => {
    if ((0,bitecs__WEBPACK_IMPORTED_MODULE_0__.getEntityComponents)(world, eid).length === 0) {
        (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.removeEntity)(world, eid);
        return true;
    }
    return false;
};
const hasComponents = (world, components, eid) => {
    for (const component of components) {
        if (!(0,bitecs__WEBPACK_IMPORTED_MODULE_0__.hasComponent)(world, component, eid)) {
            return false;
        }
    }
    return true;
};


/***/ }),

/***/ "../client/src/utils/mixer_animation.ts":
/*!**********************************************!*\
  !*** ../client/src/utils/mixer_animation.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addAnimation: () => (/* binding */ addAnimation)
/* harmony export */ });
/* harmony import */ var bitecs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bitecs */ "../../node_modules/bitecs/dist/index.mjs");
/* harmony import */ var _components_mixer_animation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/mixer_animation */ "../client/src/components/mixer_animation.ts");


const addAnimation = (world, eid, action) => {
    if (!(0,bitecs__WEBPACK_IMPORTED_MODULE_0__.hasComponent)(world, _components_mixer_animation__WEBPACK_IMPORTED_MODULE_1__.ActiveAnimations, eid)) {
        (0,bitecs__WEBPACK_IMPORTED_MODULE_0__.addComponent)(world, _components_mixer_animation__WEBPACK_IMPORTED_MODULE_1__.ActiveAnimations, eid);
        _components_mixer_animation__WEBPACK_IMPORTED_MODULE_1__.ActiveAnimationsProxy.get(eid).allocate();
    }
    _components_mixer_animation__WEBPACK_IMPORTED_MODULE_1__.ActiveAnimationsProxy.get(eid).add(action);
};


/***/ }),

/***/ "../../node_modules/bitecs/dist/index.mjs":
/*!************************************************!*\
  !*** ../../node_modules/bitecs/dist/index.mjs ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Changed: () => (/* binding */ Changed),
/* harmony export */   DESERIALIZE_MODE: () => (/* binding */ DESERIALIZE_MODE),
/* harmony export */   Not: () => (/* binding */ Not),
/* harmony export */   Types: () => (/* binding */ Types),
/* harmony export */   addComponent: () => (/* binding */ addComponent),
/* harmony export */   addEntity: () => (/* binding */ addEntity),
/* harmony export */   commitRemovals: () => (/* binding */ commitRemovals),
/* harmony export */   createWorld: () => (/* binding */ createWorld),
/* harmony export */   defineComponent: () => (/* binding */ defineComponent),
/* harmony export */   defineDeserializer: () => (/* binding */ defineDeserializer),
/* harmony export */   defineQuery: () => (/* binding */ defineQuery),
/* harmony export */   defineSerializer: () => (/* binding */ defineSerializer),
/* harmony export */   defineSystem: () => (/* binding */ defineSystem),
/* harmony export */   deleteWorld: () => (/* binding */ deleteWorld),
/* harmony export */   enterQuery: () => (/* binding */ enterQuery),
/* harmony export */   entityExists: () => (/* binding */ entityExists),
/* harmony export */   exitQuery: () => (/* binding */ exitQuery),
/* harmony export */   getEntityComponents: () => (/* binding */ getEntityComponents),
/* harmony export */   getWorldComponents: () => (/* binding */ getWorldComponents),
/* harmony export */   hasComponent: () => (/* binding */ hasComponent),
/* harmony export */   parentArray: () => (/* binding */ parentArray),
/* harmony export */   pipe: () => (/* binding */ pipe),
/* harmony export */   registerComponent: () => (/* binding */ registerComponent),
/* harmony export */   registerComponents: () => (/* binding */ registerComponents),
/* harmony export */   removeComponent: () => (/* binding */ removeComponent),
/* harmony export */   removeEntity: () => (/* binding */ removeEntity),
/* harmony export */   removeQuery: () => (/* binding */ removeQuery),
/* harmony export */   resetChangedQuery: () => (/* binding */ resetChangedQuery),
/* harmony export */   resetWorld: () => (/* binding */ resetWorld),
/* harmony export */   setDefaultSize: () => (/* binding */ setDefaultSize)
/* harmony export */ });
// src/Constants.js
var TYPES_ENUM = {
  i8: "i8",
  ui8: "ui8",
  ui8c: "ui8c",
  i16: "i16",
  ui16: "ui16",
  i32: "i32",
  ui32: "ui32",
  f32: "f32",
  f64: "f64",
  eid: "eid"
};
var TYPES_NAMES = {
  i8: "Int8",
  ui8: "Uint8",
  ui8c: "Uint8Clamped",
  i16: "Int16",
  ui16: "Uint16",
  i32: "Int32",
  ui32: "Uint32",
  eid: "Uint32",
  f32: "Float32",
  f64: "Float64"
};
var TYPES = {
  i8: Int8Array,
  ui8: Uint8Array,
  ui8c: Uint8ClampedArray,
  i16: Int16Array,
  ui16: Uint16Array,
  i32: Int32Array,
  ui32: Uint32Array,
  f32: Float32Array,
  f64: Float64Array,
  eid: Uint32Array
};
var UNSIGNED_MAX = {
  uint8: 2 ** 8,
  uint16: 2 ** 16,
  uint32: 2 ** 32
};

// src/Storage.js
var roundToMultiple = (mul) => (x) => Math.ceil(x / mul) * mul;
var roundToMultiple4 = roundToMultiple(4);
var $storeRef = Symbol("storeRef");
var $storeSize = Symbol("storeSize");
var $storeMaps = Symbol("storeMaps");
var $storeFlattened = Symbol("storeFlattened");
var $storeBase = Symbol("storeBase");
var $storeType = Symbol("storeType");
var $storeArrayElementCounts = Symbol("storeArrayElementCounts");
var $storeSubarrays = Symbol("storeSubarrays");
var $subarrayCursors = Symbol("subarrayCursors");
var $subarray = Symbol("subarray");
var $subarrayFrom = Symbol("subarrayFrom");
var $subarrayTo = Symbol("subarrayTo");
var $parentArray = Symbol("parentArray");
var $tagStore = Symbol("tagStore");
var $queryShadow = Symbol("queryShadow");
var $serializeShadow = Symbol("serializeShadow");
var $indexType = Symbol("indexType");
var $indexBytes = Symbol("indexBytes");
var $isEidType = Symbol("isEidType");
var stores = {};
var resize = (ta, size) => {
  const newBuffer = new ArrayBuffer(size * ta.BYTES_PER_ELEMENT);
  const newTa = new ta.constructor(newBuffer);
  newTa.set(ta, 0);
  return newTa;
};
var createShadow = (store, key) => {
  if (!ArrayBuffer.isView(store)) {
    const shadowStore = store[$parentArray].slice(0);
    store[key] = store.map((_, eid) => {
      const { length } = store[eid];
      const start = length * eid;
      const end = start + length;
      return shadowStore.subarray(start, end);
    });
  } else {
    store[key] = store.slice(0);
  }
};
var resizeSubarray = (metadata, store, storeSize) => {
  const cursors = metadata[$subarrayCursors];
  let type = store[$storeType];
  const length = store[0].length;
  const indexType = length <= UNSIGNED_MAX.uint8 ? TYPES_ENUM.ui8 : length <= UNSIGNED_MAX.uint16 ? TYPES_ENUM.ui16 : TYPES_ENUM.ui32;
  if (cursors[type] === 0) {
    const arrayElementCount = metadata[$storeArrayElementCounts][type];
    const array = new TYPES[type](roundToMultiple4(arrayElementCount * storeSize));
    array.set(metadata[$storeSubarrays][type]);
    metadata[$storeSubarrays][type] = array;
    array[$indexType] = TYPES_NAMES[indexType];
    array[$indexBytes] = TYPES[indexType].BYTES_PER_ELEMENT;
  }
  const start = cursors[type];
  const end = start + storeSize * length;
  cursors[type] = end;
  store[$parentArray] = metadata[$storeSubarrays][type].subarray(start, end);
  for (let eid = 0; eid < storeSize; eid++) {
    const start2 = length * eid;
    const end2 = start2 + length;
    store[eid] = store[$parentArray].subarray(start2, end2);
    store[eid][$indexType] = TYPES_NAMES[indexType];
    store[eid][$indexBytes] = TYPES[indexType].BYTES_PER_ELEMENT;
    store[eid][$subarray] = true;
  }
};
var resizeRecursive = (metadata, store, size) => {
  Object.keys(store).forEach((key) => {
    const ta = store[key];
    if (Array.isArray(ta)) {
      resizeSubarray(metadata, ta, size);
      store[$storeFlattened].push(ta);
    } else if (ArrayBuffer.isView(ta)) {
      store[key] = resize(ta, size);
      store[$storeFlattened].push(store[key]);
    } else if (typeof ta === "object") {
      resizeRecursive(metadata, store[key], size);
    }
  });
};
var resizeStore = (store, size) => {
  if (store[$tagStore])
    return;
  store[$storeSize] = size;
  store[$storeFlattened].length = 0;
  Object.keys(store[$subarrayCursors]).forEach((k) => {
    store[$subarrayCursors][k] = 0;
  });
  resizeRecursive(store, store, size);
};
var resetStoreFor = (store, eid) => {
  if (store[$storeFlattened]) {
    store[$storeFlattened].forEach((ta) => {
      if (ArrayBuffer.isView(ta))
        ta[eid] = 0;
      else
        ta[eid].fill(0);
    });
  }
};
var createTypeStore = (type, length) => {
  const totalBytes = length * TYPES[type].BYTES_PER_ELEMENT;
  const buffer = new ArrayBuffer(totalBytes);
  const store = new TYPES[type](buffer);
  store[$isEidType] = type === TYPES_ENUM.eid;
  return store;
};
var parentArray = (store) => store[$parentArray];
var createArrayStore = (metadata, type, length) => {
  const storeSize = metadata[$storeSize];
  const store = Array(storeSize).fill(0);
  store[$storeType] = type;
  store[$isEidType] = type === TYPES_ENUM.eid;
  const cursors = metadata[$subarrayCursors];
  const indexType = length <= UNSIGNED_MAX.uint8 ? TYPES_ENUM.ui8 : length <= UNSIGNED_MAX.uint16 ? TYPES_ENUM.ui16 : TYPES_ENUM.ui32;
  if (!length)
    throw new Error("bitECS - Must define component array length");
  if (!TYPES[type])
    throw new Error(`bitECS - Invalid component array property type ${type}`);
  if (!metadata[$storeSubarrays][type]) {
    const arrayElementCount = metadata[$storeArrayElementCounts][type];
    const array = new TYPES[type](roundToMultiple4(arrayElementCount * storeSize));
    array[$indexType] = TYPES_NAMES[indexType];
    array[$indexBytes] = TYPES[indexType].BYTES_PER_ELEMENT;
    metadata[$storeSubarrays][type] = array;
  }
  const start = cursors[type];
  const end = start + storeSize * length;
  cursors[type] = end;
  store[$parentArray] = metadata[$storeSubarrays][type].subarray(start, end);
  for (let eid = 0; eid < storeSize; eid++) {
    const start2 = length * eid;
    const end2 = start2 + length;
    store[eid] = store[$parentArray].subarray(start2, end2);
    store[eid][$indexType] = TYPES_NAMES[indexType];
    store[eid][$indexBytes] = TYPES[indexType].BYTES_PER_ELEMENT;
    store[eid][$subarray] = true;
  }
  return store;
};
var isArrayType = (x) => Array.isArray(x) && typeof x[0] === "string" && typeof x[1] === "number";
var createStore = (schema, size) => {
  const $store = Symbol("store");
  if (!schema || !Object.keys(schema).length) {
    stores[$store] = {
      [$storeSize]: size,
      [$tagStore]: true,
      [$storeBase]: () => stores[$store]
    };
    return stores[$store];
  }
  schema = JSON.parse(JSON.stringify(schema));
  const arrayElementCounts = {};
  const collectArrayElementCounts = (s) => {
    const keys = Object.keys(s);
    for (const k of keys) {
      if (isArrayType(s[k])) {
        if (!arrayElementCounts[s[k][0]])
          arrayElementCounts[s[k][0]] = 0;
        arrayElementCounts[s[k][0]] += s[k][1];
      } else if (s[k] instanceof Object) {
        collectArrayElementCounts(s[k]);
      }
    }
  };
  collectArrayElementCounts(schema);
  const metadata = {
    [$storeSize]: size,
    [$storeMaps]: {},
    [$storeSubarrays]: {},
    [$storeRef]: $store,
    [$subarrayCursors]: Object.keys(TYPES).reduce((a, type) => ({ ...a, [type]: 0 }), {}),
    [$storeFlattened]: [],
    [$storeArrayElementCounts]: arrayElementCounts
  };
  if (schema instanceof Object && Object.keys(schema).length) {
    const recursiveTransform = (a, k) => {
      if (typeof a[k] === "string") {
        a[k] = createTypeStore(a[k], size);
        a[k][$storeBase] = () => stores[$store];
        metadata[$storeFlattened].push(a[k]);
      } else if (isArrayType(a[k])) {
        const [type, length] = a[k];
        a[k] = createArrayStore(metadata, type, length);
        a[k][$storeBase] = () => stores[$store];
        metadata[$storeFlattened].push(a[k]);
      } else if (a[k] instanceof Object) {
        a[k] = Object.keys(a[k]).reduce(recursiveTransform, a[k]);
      }
      return a;
    };
    stores[$store] = Object.assign(Object.keys(schema).reduce(recursiveTransform, schema), metadata);
    stores[$store][$storeBase] = () => stores[$store];
    return stores[$store];
  }
};

// src/Util.js
var SparseSet = () => {
  const dense = [];
  const sparse = [];
  dense.sort = function(comparator) {
    const result = Array.prototype.sort.call(this, comparator);
    for (let i = 0; i < dense.length; i++) {
      sparse[dense[i]] = i;
    }
    return result;
  };
  const has = (val) => dense[sparse[val]] === val;
  const add = (val) => {
    if (has(val))
      return;
    sparse[val] = dense.push(val) - 1;
  };
  const remove = (val) => {
    if (!has(val))
      return;
    const index = sparse[val];
    const swapped = dense.pop();
    if (swapped !== val) {
      dense[index] = swapped;
      sparse[swapped] = index;
    }
  };
  return {
    add,
    remove,
    has,
    sparse,
    dense
  };
};

// src/Serialize.js
var DESERIALIZE_MODE = {
  REPLACE: 0,
  APPEND: 1,
  MAP: 2
};
var resized = false;
var setSerializationResized = (v) => {
  resized = v;
};
var concat = (a, v) => a.concat(v);
var not = (fn) => (v) => !fn(v);
var storeFlattened = (c) => c[$storeFlattened];
var isFullComponent = storeFlattened;
var isProperty = not(isFullComponent);
var isModifier = (c) => typeof c === "function";
var isNotModifier = not(isModifier);
var isChangedModifier = (c) => isModifier(c) && c()[1] === "changed";
var isWorld = (w) => Object.getOwnPropertySymbols(w).includes($componentMap);
var fromModifierToComponent = (c) => c()[0];
var canonicalize = (target) => {
  if (isWorld(target))
    return [[], /* @__PURE__ */ new Map()];
  const fullComponentProps = target.filter(isNotModifier).filter(isFullComponent).map(storeFlattened).reduce(concat, []);
  const changedComponentProps = target.filter(isChangedModifier).map(fromModifierToComponent).filter(isFullComponent).map(storeFlattened).reduce(concat, []);
  const props = target.filter(isNotModifier).filter(isProperty);
  const changedProps = target.filter(isChangedModifier).map(fromModifierToComponent).filter(isProperty);
  const componentProps = [...fullComponentProps, ...props, ...changedComponentProps, ...changedProps];
  const allChangedProps = [...changedComponentProps, ...changedProps].reduce((map, prop) => {
    const $ = Symbol();
    createShadow(prop, $);
    map.set(prop, $);
    return map;
  }, /* @__PURE__ */ new Map());
  return [componentProps, allChangedProps];
};
var defineSerializer = (target, maxBytes = 2e7) => {
  const worldSerializer = isWorld(target);
  let [componentProps, changedProps] = canonicalize(target);
  const buffer = new ArrayBuffer(maxBytes);
  const view = new DataView(buffer);
  const entityComponentCache = /* @__PURE__ */ new Map();
  return (ents) => {
    if (resized) {
      [componentProps, changedProps] = canonicalize(target);
      resized = false;
    }
    if (worldSerializer) {
      componentProps = [];
      target[$componentMap].forEach((c, component) => {
        if (component[$storeFlattened])
          componentProps.push(...component[$storeFlattened]);
        else
          componentProps.push(component);
      });
    }
    let world;
    if (Object.getOwnPropertySymbols(ents).includes($componentMap)) {
      world = ents;
      ents = ents[$entityArray];
    } else {
      world = eidToWorld.get(ents[0]);
    }
    let where = 0;
    if (!ents.length)
      return buffer.slice(0, where);
    const cache = /* @__PURE__ */ new Map();
    for (let pid = 0; pid < componentProps.length; pid++) {
      const prop = componentProps[pid];
      const component = prop[$storeBase]();
      const $diff = changedProps.get(prop);
      const shadow = $diff ? prop[$diff] : null;
      if (!cache.has(component))
        cache.set(component, /* @__PURE__ */ new Map());
      view.setUint8(where, pid);
      where += 1;
      const countWhere = where;
      where += 4;
      let writeCount = 0;
      for (let i = 0; i < ents.length; i++) {
        const eid = ents[i];
        let componentCache = entityComponentCache.get(eid);
        if (!componentCache)
          componentCache = entityComponentCache.set(eid, /* @__PURE__ */ new Set()).get(eid);
        componentCache.add(eid);
        const newlyAddedComponent = shadow && cache.get(component).get(eid) || !componentCache.has(component) && hasComponent(world, component, eid);
        cache.get(component).set(eid, newlyAddedComponent);
        if (newlyAddedComponent) {
          componentCache.add(component);
        } else if (!hasComponent(world, component, eid)) {
          componentCache.delete(component);
          continue;
        }
        const rewindWhere = where;
        view.setUint32(where, eid);
        where += 4;
        if (prop[$tagStore]) {
          writeCount++;
          continue;
        }
        if (ArrayBuffer.isView(prop[eid])) {
          const type = prop[eid].constructor.name.replace("Array", "");
          const indexType = prop[eid][$indexType];
          const indexBytes = prop[eid][$indexBytes];
          const countWhere2 = where;
          where += indexBytes;
          let arrayWriteCount = 0;
          for (let i2 = 0; i2 < prop[eid].length; i2++) {
            if (shadow) {
              const changed = shadow[eid][i2] !== prop[eid][i2];
              shadow[eid][i2] = prop[eid][i2];
              if (!changed && !newlyAddedComponent) {
                continue;
              }
            }
            view[`set${indexType}`](where, i2);
            where += indexBytes;
            const value = prop[eid][i2];
            view[`set${type}`](where, value);
            where += prop[eid].BYTES_PER_ELEMENT;
            arrayWriteCount++;
          }
          if (arrayWriteCount > 0) {
            view[`set${indexType}`](countWhere2, arrayWriteCount);
            writeCount++;
          } else {
            where = rewindWhere;
            continue;
          }
        } else {
          if (shadow) {
            const changed = shadow[eid] !== prop[eid];
            shadow[eid] = prop[eid];
            if (!changed && !newlyAddedComponent) {
              where = rewindWhere;
              continue;
            }
          }
          const type = prop.constructor.name.replace("Array", "");
          view[`set${type}`](where, prop[eid]);
          where += prop.BYTES_PER_ELEMENT;
          writeCount++;
        }
      }
      if (writeCount > 0) {
        view.setUint32(countWhere, writeCount);
      } else {
        where -= 5;
      }
    }
    return buffer.slice(0, where);
  };
};
var newEntities = /* @__PURE__ */ new Map();
var defineDeserializer = (target) => {
  const isWorld2 = Object.getOwnPropertySymbols(target).includes($componentMap);
  let [componentProps] = canonicalize(target);
  const deserializedEntities = /* @__PURE__ */ new Set();
  return (world, packet, mode = 0) => {
    newEntities.clear();
    if (resized) {
      [componentProps] = canonicalize(target);
      resized = false;
    }
    if (isWorld2) {
      componentProps = [];
      target[$componentMap].forEach((c, component) => {
        if (component[$storeFlattened])
          componentProps.push(...component[$storeFlattened]);
        else
          componentProps.push(component);
      });
    }
    const localEntities = world[$localEntities];
    const localEntityLookup = world[$localEntityLookup];
    const view = new DataView(packet);
    let where = 0;
    while (where < packet.byteLength) {
      const pid = view.getUint8(where);
      where += 1;
      const entityCount = view.getUint32(where);
      where += 4;
      const prop = componentProps[pid];
      for (let i = 0; i < entityCount; i++) {
        let eid = view.getUint32(where);
        where += 4;
        if (mode === DESERIALIZE_MODE.MAP) {
          if (localEntities.has(eid)) {
            eid = localEntities.get(eid);
          } else if (newEntities.has(eid)) {
            eid = newEntities.get(eid);
          } else {
            const newEid = addEntity(world);
            localEntities.set(eid, newEid);
            localEntityLookup.set(newEid, eid);
            newEntities.set(eid, newEid);
            eid = newEid;
          }
        }
        if (mode === DESERIALIZE_MODE.APPEND || mode === DESERIALIZE_MODE.REPLACE && !world[$entitySparseSet].has(eid)) {
          const newEid = newEntities.get(eid) || addEntity(world);
          newEntities.set(eid, newEid);
          eid = newEid;
        }
        const component = prop[$storeBase]();
        if (!hasComponent(world, component, eid)) {
          addComponent(world, component, eid);
        }
        deserializedEntities.add(eid);
        if (component[$tagStore]) {
          continue;
        }
        if (ArrayBuffer.isView(prop[eid])) {
          const array = prop[eid];
          const count = view[`get${array[$indexType]}`](where);
          where += array[$indexBytes];
          for (let i2 = 0; i2 < count; i2++) {
            const index = view[`get${array[$indexType]}`](where);
            where += array[$indexBytes];
            const value = view[`get${array.constructor.name.replace("Array", "")}`](where);
            where += array.BYTES_PER_ELEMENT;
            if (prop[$isEidType]) {
              let localEid;
              if (localEntities.has(value)) {
                localEid = localEntities.get(value);
              } else if (newEntities.has(value)) {
                localEid = newEntities.get(value);
              } else {
                const newEid = addEntity(world);
                localEntities.set(value, newEid);
                localEntityLookup.set(newEid, value);
                newEntities.set(value, newEid);
                localEid = newEid;
              }
              prop[eid][index] = localEid;
            } else
              prop[eid][index] = value;
          }
        } else {
          const value = view[`get${prop.constructor.name.replace("Array", "")}`](where);
          where += prop.BYTES_PER_ELEMENT;
          if (prop[$isEidType]) {
            let localEid;
            if (localEntities.has(value)) {
              localEid = localEntities.get(value);
            } else if (newEntities.has(value)) {
              localEid = newEntities.get(value);
            } else {
              const newEid = addEntity(world);
              localEntities.set(value, newEid);
              localEntityLookup.set(newEid, value);
              newEntities.set(value, newEid);
              localEid = newEid;
            }
            prop[eid] = localEid;
          } else
            prop[eid] = value;
        }
      }
    }
    const ents = Array.from(deserializedEntities);
    deserializedEntities.clear();
    return ents;
  };
};

// src/Entity.js
var $entityMasks = Symbol("entityMasks");
var $entityComponents = Symbol("entityComponents");
var $entitySparseSet = Symbol("entitySparseSet");
var $entityArray = Symbol("entityArray");
var $entityIndices = Symbol("entityIndices");
var $removedEntities = Symbol("removedEntities");
var defaultSize = 1e5;
var globalEntityCursor = 0;
var globalSize = defaultSize;
var resizeThreshold = () => globalSize - globalSize / 5;
var getGlobalSize = () => globalSize;
var removed = [];
var resetGlobals = () => {
  globalSize = defaultSize;
  globalEntityCursor = 0;
  removed.length = 0;
};
var setDefaultSize = (newSize) => {
  const oldSize = globalSize;
  defaultSize = newSize;
  resetGlobals();
  globalSize = newSize;
  resizeWorlds(newSize);
  resizeComponents(newSize);
  setSerializationResized(true);
  console.info(`\u{1F47E} bitECS - resizing all data stores from ${oldSize} to ${newSize}`);
};
var getEntityCursor = () => globalEntityCursor;
var eidToWorld = /* @__PURE__ */ new Map();
var addEntity = (world) => {
  if (globalEntityCursor >= resizeThreshold()) {
    const size = globalSize;
    const amount = Math.ceil(size / 2 / 4) * 4;
    setDefaultSize(size + amount);
  }
  const eid = removed.length > Math.round(defaultSize * 0.01) ? removed.shift() : globalEntityCursor++;
  world[$entitySparseSet].add(eid);
  eidToWorld.set(eid, world);
  world[$notQueries].forEach((q) => {
    const match = queryCheckEntity(world, q, eid);
    if (match)
      queryAddEntity(q, eid);
  });
  world[$entityComponents].set(eid, /* @__PURE__ */ new Set());
  return eid;
};
var removeEntity = (world, eid) => {
  if (!world[$entitySparseSet].has(eid))
    return;
  world[$queries].forEach((q) => {
    queryRemoveEntity(world, q, eid);
  });
  removed.push(eid);
  world[$entitySparseSet].remove(eid);
  world[$entityComponents].delete(eid);
  world[$localEntities].delete(world[$localEntityLookup].get(eid));
  world[$localEntityLookup].delete(eid);
  for (let i = 0; i < world[$entityMasks].length; i++)
    world[$entityMasks][i][eid] = 0;
};
var getEntityComponents = (world, eid) => {
  if (eid === void 0)
    throw new Error("bitECS - entity is undefined.");
  if (!world[$entitySparseSet].has(eid))
    throw new Error("bitECS - entity does not exist in the world.");
  return Array.from(world[$entityComponents].get(eid));
};
var entityExists = (world, eid) => world[$entitySparseSet].has(eid);

// src/Query.js
function Not(c) {
  return () => [c, "not"];
}
function Changed(c) {
  return () => [c, "changed"];
}
function Any(...comps) {
  return function QueryAny() {
    return comps;
  };
}
function All(...comps) {
  return function QueryAll() {
    return comps;
  };
}
function None(...comps) {
  return function QueryNone() {
    return comps;
  };
}
var $queries = Symbol("queries");
var $notQueries = Symbol("notQueries");
var $queryAny = Symbol("queryAny");
var $queryAll = Symbol("queryAll");
var $queryNone = Symbol("queryNone");
var $queryMap = Symbol("queryMap");
var $dirtyQueries = Symbol("$dirtyQueries");
var $queryComponents = Symbol("queryComponents");
var $enterQuery = Symbol("enterQuery");
var $exitQuery = Symbol("exitQuery");
var enterQuery = (query) => (world) => {
  if (!world[$queryMap].has(query))
    registerQuery(world, query);
  const q = world[$queryMap].get(query);
  const entered = q.entered.dense.slice();
  q.entered = SparseSet();
  return entered;
};
var exitQuery = (query) => (world) => {
  if (!world[$queryMap].has(query))
    registerQuery(world, query);
  const q = world[$queryMap].get(query);
  const exited = q.exited.dense.slice();
  q.exited = SparseSet();
  return exited;
};
var registerQuery = (world, query) => {
  const components2 = [];
  const notComponents = [];
  const changedComponents = [];
  query[$queryComponents].forEach((c) => {
    if (typeof c === "function") {
      const [comp, mod] = c();
      if (!world[$componentMap].has(comp))
        registerComponent(world, comp);
      if (mod === "not") {
        notComponents.push(comp);
      }
      if (mod === "changed") {
        changedComponents.push(comp);
        components2.push(comp);
      }
    } else {
      if (!world[$componentMap].has(c))
        registerComponent(world, c);
      components2.push(c);
    }
  });
  const mapComponents = (c) => world[$componentMap].get(c);
  const allComponents = components2.concat(notComponents).map(mapComponents);
  const sparseSet = SparseSet();
  const archetypes = [];
  const changed = [];
  const toRemove = SparseSet();
  const entered = SparseSet();
  const exited = SparseSet();
  const generations = allComponents.map((c) => c.generationId).reduce((a, v) => {
    if (a.includes(v))
      return a;
    a.push(v);
    return a;
  }, []);
  const reduceBitflags = (a, c) => {
    if (!a[c.generationId])
      a[c.generationId] = 0;
    a[c.generationId] |= c.bitflag;
    return a;
  };
  const masks = components2.map(mapComponents).reduce(reduceBitflags, {});
  const notMasks = notComponents.map(mapComponents).reduce(reduceBitflags, {});
  const hasMasks = allComponents.reduce(reduceBitflags, {});
  const flatProps = components2.filter((c) => !c[$tagStore]).map((c) => Object.getOwnPropertySymbols(c).includes($storeFlattened) ? c[$storeFlattened] : [c]).reduce((a, v) => a.concat(v), []);
  const shadows = [];
  const q = Object.assign(sparseSet, {
    archetypes,
    changed,
    components: components2,
    notComponents,
    changedComponents,
    allComponents,
    masks,
    notMasks,
    hasMasks,
    generations,
    flatProps,
    toRemove,
    entered,
    exited,
    shadows
  });
  world[$queryMap].set(query, q);
  world[$queries].add(q);
  allComponents.forEach((c) => {
    c.queries.add(q);
  });
  if (notComponents.length)
    world[$notQueries].add(q);
  for (let eid = 0; eid < getEntityCursor(); eid++) {
    if (!world[$entitySparseSet].has(eid))
      continue;
    const match = queryCheckEntity(world, q, eid);
    if (match)
      queryAddEntity(q, eid);
  }
};
var generateShadow = (q, pid) => {
  const $ = Symbol();
  const prop = q.flatProps[pid];
  createShadow(prop, $);
  q.shadows[pid] = prop[$];
  return prop[$];
};
var diff = (q, clearDiff) => {
  if (clearDiff)
    q.changed = [];
  const { flatProps, shadows } = q;
  for (let i = 0; i < q.dense.length; i++) {
    const eid = q.dense[i];
    let dirty = false;
    for (let pid = 0; pid < flatProps.length; pid++) {
      const prop = flatProps[pid];
      const shadow = shadows[pid] || generateShadow(q, pid);
      if (ArrayBuffer.isView(prop[eid])) {
        for (let i2 = 0; i2 < prop[eid].length; i2++) {
          if (prop[eid][i2] !== shadow[eid][i2]) {
            dirty = true;
            break;
          }
        }
        shadow[eid].set(prop[eid]);
      } else {
        if (prop[eid] !== shadow[eid]) {
          dirty = true;
          shadow[eid] = prop[eid];
        }
      }
    }
    if (dirty)
      q.changed.push(eid);
  }
  return q.changed;
};
var flatten = (a, v) => a.concat(v);
var aggregateComponentsFor = (mod) => (x) => x.filter((f) => f.name === mod().constructor.name).reduce(flatten);
var getAnyComponents = aggregateComponentsFor(Any);
var getAllComponents = aggregateComponentsFor(All);
var getNoneComponents = aggregateComponentsFor(None);
var defineQuery = (...args) => {
  let components2;
  let any, all, none;
  if (Array.isArray(args[0])) {
    components2 = args[0];
  } else {
  }
  if (components2 === void 0 || components2[$componentMap] !== void 0) {
    return (world) => world ? world[$entityArray] : components2[$entityArray];
  }
  const query = function(world, clearDiff = true) {
    if (!world[$queryMap].has(query))
      registerQuery(world, query);
    const q = world[$queryMap].get(query);
    commitRemovals(world);
    if (q.changedComponents.length)
      return diff(q, clearDiff);
    return q.dense;
  };
  query[$queryComponents] = components2;
  query[$queryAny] = any;
  query[$queryAll] = all;
  query[$queryNone] = none;
  return query;
};
var queryCheckEntity = (world, q, eid) => {
  const { masks, notMasks, generations } = q;
  let or = 0;
  for (let i = 0; i < generations.length; i++) {
    const generationId = generations[i];
    const qMask = masks[generationId];
    const qNotMask = notMasks[generationId];
    const eMask = world[$entityMasks][generationId][eid];
    if (qNotMask && (eMask & qNotMask) !== 0) {
      return false;
    }
    if (qMask && (eMask & qMask) !== qMask) {
      return false;
    }
  }
  return true;
};
var queryAddEntity = (q, eid) => {
  q.toRemove.remove(eid);
  q.entered.add(eid);
  q.add(eid);
};
var queryCommitRemovals = (q) => {
  for (let i = q.toRemove.dense.length - 1; i >= 0; i--) {
    const eid = q.toRemove.dense[i];
    q.toRemove.remove(eid);
    q.remove(eid);
  }
};
var commitRemovals = (world) => {
  if (!world[$dirtyQueries].size)
    return;
  world[$dirtyQueries].forEach(queryCommitRemovals);
  world[$dirtyQueries].clear();
};
var queryRemoveEntity = (world, q, eid) => {
  if (!q.has(eid) || q.toRemove.has(eid))
    return;
  q.toRemove.add(eid);
  world[$dirtyQueries].add(q);
  q.exited.add(eid);
};
var resetChangedQuery = (world, query) => {
  const q = world[$queryMap].get(query);
  q.changed = [];
};
var removeQuery = (world, query) => {
  const q = world[$queryMap].get(query);
  world[$queries].delete(q);
  world[$queryMap].delete(query);
};

// src/Component.js
var $componentMap = Symbol("componentMap");
var components = [];
var resizeComponents = (size) => {
  components.forEach((component) => resizeStore(component, size));
};
var defineComponent = (schema, size) => {
  const component = createStore(schema, size || getGlobalSize());
  if (schema && Object.keys(schema).length)
    components.push(component);
  return component;
};
var incrementBitflag = (world) => {
  world[$bitflag] *= 2;
  if (world[$bitflag] >= 2 ** 31) {
    world[$bitflag] = 1;
    world[$entityMasks].push(new Uint32Array(world[$size]));
  }
};
var registerComponent = (world, component) => {
  if (!component)
    throw new Error(`bitECS - Cannot register null or undefined component`);
  const queries = /* @__PURE__ */ new Set();
  const notQueries = /* @__PURE__ */ new Set();
  const changedQueries = /* @__PURE__ */ new Set();
  world[$queries].forEach((q) => {
    if (q.allComponents.includes(component)) {
      queries.add(q);
    }
  });
  world[$componentMap].set(component, {
    generationId: world[$entityMasks].length - 1,
    bitflag: world[$bitflag],
    store: component,
    queries,
    notQueries,
    changedQueries
  });
  if (component[$storeSize] < getGlobalSize()) {
    resizeStore(component, getGlobalSize());
  }
  incrementBitflag(world);
};
var registerComponents = (world, components2) => {
  components2.forEach((c) => registerComponent(world, c));
};
var hasComponent = (world, component, eid) => {
  const registeredComponent = world[$componentMap].get(component);
  if (!registeredComponent)
    return false;
  const { generationId, bitflag } = registeredComponent;
  const mask = world[$entityMasks][generationId][eid];
  return (mask & bitflag) === bitflag;
};
var addComponent = (world, component, eid, reset = false) => {
  if (eid === void 0)
    throw new Error("bitECS - entity is undefined.");
  if (!world[$entitySparseSet].has(eid))
    throw new Error("bitECS - entity does not exist in the world.");
  if (!world[$componentMap].has(component))
    registerComponent(world, component);
  if (hasComponent(world, component, eid))
    return;
  const c = world[$componentMap].get(component);
  const { generationId, bitflag, queries, notQueries } = c;
  world[$entityMasks][generationId][eid] |= bitflag;
  queries.forEach((q) => {
    if (q.toRemove.has(eid))
      q.toRemove.remove(eid);
    const match = queryCheckEntity(world, q, eid);
    if (match)
      queryAddEntity(q, eid);
    if (!match)
      queryRemoveEntity(world, q, eid);
  });
  world[$entityComponents].get(eid).add(component);
  if (reset)
    resetStoreFor(component, eid);
};
var removeComponent = (world, component, eid, reset = true) => {
  if (eid === void 0)
    throw new Error("bitECS - entity is undefined.");
  if (!world[$entitySparseSet].has(eid))
    throw new Error("bitECS - entity does not exist in the world.");
  if (!hasComponent(world, component, eid))
    return;
  const c = world[$componentMap].get(component);
  const { generationId, bitflag, queries } = c;
  world[$entityMasks][generationId][eid] &= ~bitflag;
  queries.forEach((q) => {
    if (q.toRemove.has(eid))
      q.toRemove.remove(eid);
    const match = queryCheckEntity(world, q, eid);
    if (match)
      queryAddEntity(q, eid);
    if (!match)
      queryRemoveEntity(world, q, eid);
  });
  world[$entityComponents].get(eid).delete(component);
  if (reset)
    resetStoreFor(component, eid);
};

// src/World.js
var $size = Symbol("size");
var $resizeThreshold = Symbol("resizeThreshold");
var $bitflag = Symbol("bitflag");
var $archetypes = Symbol("archetypes");
var $localEntities = Symbol("localEntities");
var $localEntityLookup = Symbol("localEntityLookp");
var worlds = [];
var resizeWorlds = (size) => {
  worlds.forEach((world) => {
    world[$size] = size;
    for (let i = 0; i < world[$entityMasks].length; i++) {
      const masks = world[$entityMasks][i];
      world[$entityMasks][i] = resize(masks, size);
    }
    world[$resizeThreshold] = world[$size] - world[$size] / 5;
  });
};
var createWorld = (...args) => {
  const world = typeof args[0] === "object" ? args[0] : {};
  const size = typeof args[0] === "number" ? args[0] : typeof args[1] === "number" ? args[1] : getGlobalSize();
  resetWorld(world, size);
  worlds.push(world);
  return world;
};
var resetWorld = (world, size = getGlobalSize()) => {
  world[$size] = size;
  if (world[$entityArray])
    world[$entityArray].forEach((eid) => removeEntity(world, eid));
  world[$entityMasks] = [new Uint32Array(size)];
  world[$entityComponents] = /* @__PURE__ */ new Map();
  world[$archetypes] = [];
  world[$entitySparseSet] = SparseSet();
  world[$entityArray] = world[$entitySparseSet].dense;
  world[$bitflag] = 1;
  world[$componentMap] = /* @__PURE__ */ new Map();
  world[$queryMap] = /* @__PURE__ */ new Map();
  world[$queries] = /* @__PURE__ */ new Set();
  world[$notQueries] = /* @__PURE__ */ new Set();
  world[$dirtyQueries] = /* @__PURE__ */ new Set();
  world[$localEntities] = /* @__PURE__ */ new Map();
  world[$localEntityLookup] = /* @__PURE__ */ new Map();
  return world;
};
var deleteWorld = (world) => {
  Object.getOwnPropertySymbols(world).forEach(($) => {
    delete world[$];
  });
  Object.keys(world).forEach((key) => {
    delete world[key];
  });
  worlds.splice(worlds.indexOf(world), 1);
};
var getWorldComponents = (world) => Array.from(world[$componentMap].keys());

// src/System.js
var defineSystem = (update) => (world, ...args) => {
  update(world, ...args);
  return world;
};

// src/index.js
var pipe = (...fns) => (input) => {
  let tmp = input;
  for (let i = 0; i < fns.length; i++) {
    const fn = fns[i];
    tmp = fn(tmp);
  }
  return tmp;
};
var Types = TYPES_ENUM;

//# sourceMappingURL=index.mjs.map


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gltfMixerAnimationSystem: () => (/* reexport safe */ _systems_gltf_mixer_animation__WEBPACK_IMPORTED_MODULE_0__.gltfMixerAnimationSystem)
/* harmony export */ });
/* harmony import */ var _systems_gltf_mixer_animation__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./systems/gltf_mixer_animation */ "./src/systems/gltf_mixer_animation.ts");


})();

/******/ })()
;
//# sourceMappingURL=addons.bundle.js.map