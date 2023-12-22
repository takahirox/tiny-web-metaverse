# Tiny Web Metaverse Client Core

[![Latest NPM release](https://img.shields.io/npm/v/@tiny-web-metaverse/client.svg)](https://www.npmjs.com/package/@tiny-web-metaverse/client)

Client Core is responsible for the core processing of the Tiny Web Metaverse
Client. Specifically, it handles the following processing:

* bitECS resource management
* 3D graphics rendering using WebGL
* VR/AR processing using WebXR, such as positional tracking
* Network synchronization of object states with remote clients using WebSockets via State server
* Audio and video communication with remote clients using WebRTC via Stream server
* Input handling from input devices such as mouse, keyboard, touchscreen, VR headset, and so on

Client Core only performs the minimum necessary core tasks, such as Web API,
networking, and event handling. More advanced processing must be implemented in
applications.

Reusable codes are published as addons, which can be imported and used from
the [Addons package](../addons).

## How to install and build

```sh
$ npm install
$ npm run build
```

## Documents

[Client Core Concept](../../docs/development/client_core_concept.md) for a
deeper understanding.
