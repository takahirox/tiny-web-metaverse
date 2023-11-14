# Tiny Web Metaverse

Tiny Web Metaverse is a Web-based multi-user 3D virtual space framework with
high flexibility and extensibility. It is built on web standards, making it
familiar and easy to use for developers with Web development experience.

Tiny Web Metaverse adopts an ECS architecture. This architecture makes it
easy to add or modify features without having to modify existing code.

Tiny Web Metaverse uses Docker containers to reduce the overhead of environment
setup.

## Online Demo

[Online Demo](https://tiny-web-metaverse.net)

Click to enter a room, and then share the URL (with `?room_id=xxx`) with your 
friends to meet up with in a room.

Built on this framework, this demo offers the following features:

* 3D Exploration: Walk around and rotate the 3D space
* Collaborative Object Manipulation: Collaborate with remote users to manipulate
  objects in the 3D space
* Audio and Text Chat: Communicate with remote users via audio or text
* Mobile-Friendly: Good support for mobile devices
* VR/AR Experience: Experience the 3D space in a realistic way using VR/AR
  devices
* AI Model Generation: Generate 3D models automatically using generative AI

## Screenshots

<img src="./screenshots/screenshot_mobile.png" width="480" /><br />
<img src="./screenshots/screenshot_mobile_vr.png" width="480" /><br />
<img src="./screenshots/screenshot_mobile_ar.png" width="480" />

## What this framework provides

This framework makes it easy to create and deploy multiplayer virtual 3D space
web apps that reflect user ideas in a free way, with its ease of adding custom
features and self-hosting.

The advent of [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
and [WebGPU](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API), as
well as JavaScript 3D graphics libraries that use them, has made 3D rendering
easier in browsers. Also, [WebXR](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API),
[WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API), and
[WebRTC](https://webrtc.org/) have made it possible to create web apps with
VR/AR, and real-time network processing.

Many people are interested in developing multiplayer virtual 3D space web apps
that could be used to create applications that realize new forms of human
interaction, such as open online games and virtual events.

However, developing them can be surprisingly difficult. You need to develop both
the client and the server, and you need knowledge of hosting and Web APIs. These
processes can be cumbersome.

There are ways to use existing platforms to create custom content, but they can
be restrictive, as custom logic can be difficult to add, and you may need to
register with the platform.

To address these challenges, I created a framework that is easy to modify, extend,
and self-host.

The framework handles the cumbersome processing of the above Web APIs,so you can
focus on your own custom logic and content creation. It is also built on
technologies that are commonly used in web app development, such as
[JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) and
[TypeScript](https://www.typescriptlang.org/), so you can develop with a familiar
development environment and workflow.

## Features

* Extendibility and flexibility with [ECS architecture](https://en.wikipedia.org/wiki/Entity_component_system)
* Easy self-hosting with [Docker](https://www.docker.com/)
* VR/AR support with [WebXR](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)
* Real-time network synchronization with [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
* Real-time Audio/Video communication with [WebRTC](https://webrtc.org/)
* Audio effects with [WebAudio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
* Support for mobile devices
* Accelerates development with standard Web technologies

## Architecture overview

Client:

- 3D graphics rendering using WebGL
- VR/AR processing using WebXR, such as positional tracking
- Network synchronization of object states with remote clients using WebSockets
  via State server
- Audio and video communication with remote clients using WebRTC via Stream
  server
- Input handling from input devices such as mouse, keyboard, touchscreen,
  VR headset, and so on

Stream server:

- SFU WebRTC server for client-to-client audio and video communication
- Reduces the burden on the publisher, and also saves the number of WebRTC
  connections

State server:

- A Pub/Sub server for synchronizing object state between clients
- Adopts a Pub/Sub architecture, which makes it loosely coupled and scalable

Database:

- Used by the state server to store object state

<img src="./diagrams/overview.svg">

## Sub-projects

This project consists of the sub projects. See `packages` directory.

* [addons](https://github.com/takahirox/tiny-web-metaverse/tree/main/packages/addons): Addons for Client
* [client](https://github.com/takahirox/tiny-web-metaverse/tree/main/packages/client): Client
* [examples](https://github.com/takahirox/tiny-web-metaverse/tree/main/packages/examples): Demo
* [state_client](https://github.com/takahirox/tiny-web-metaverse/tree/main/packages/state_client): Client of State server
* [state_server](https://github.com/takahirox/tiny-web-metaverse/tree/main/packages/state_server): State server
* [stream_client](https://github.com/takahirox/tiny-web-metaverse/tree/main/packages/stream_client): Client of Stream server
* [stream_server](https://github.com/takahirox/tiny-web-metaverse/tree/main/packages/stream_server): Stream server

## How to add custom logic

See [the Readme of Client](https://github.com/takahirox/tiny-web-metaverse/tree/main/packages/client)

## How to build

```sh
$ git clone https://github.com/takahirox/tiny-web-metaverse.git
$ cd tiny-web-metaverse
$ npm run install:all
$ npm run build:all
```

## How to run Demo locally

Prerequirements:

* Install [PostgreSQL](https://www.postgresql.org/)
  * Setup User/Password as postgres/postgres
* Install [Elixir](https://elixir-lang.org/)
* [Build the project](#how-to-build)

```sh
# Terminal 1
$ cd packages/stream_server
$ npm run server

# Terminal 2
$ cd packages/state_server
$ mix deps.get
$ mix deps.compile
$ mix ecto.create
$ mix ecto.migrate
$ mix phx.server

# Terminal 3
$ cd packages/examples
$ npm run server
```

And access http://localhost:8080 on your browser.

## How to run Demo locally with Docker

Prerequirements:

* Install [Docker](https://www.docker.com/)

```sh
$ ./Dockerfiles/up.sh
```

And access http://localhost:8080 on your browser.

## Deploy Demo to AWS ECS with Docker

TODO: Use AWS cloud formation for easier deployment? [#38](https://github.com/takahirox/tiny-web-metaverse/issues/38)

Prerequirements:

* Get your own domain name (eg: [Amazon Route 53](https://aws.amazon.com/getting-started/hands-on/get-a-domain/))
* [Make an AWS account](https://aws.amazon.com/)
* [Login to AWS Management console](https://aws.amazon.com/console/)

### Create security groups

Security group 1: For internal instance

Inbound Rule 1:
- Port range: 22
- Type: SSH
- Protocol: TCP
- Source type: Custom
- Source: 0.0.0.0/0
- Description: SSH

Inbound Rule 2:
- Port range: 2000 - 2100
- Type: Custom UDP
- Protocol: UDP
- Source type: Custom
- Source: 0.0.0.0/0
- Description: stream_server_udp-private

Inbound Rule 3:
- Port range: 2000 - 2100
- Type: Custom TCP
- Protocol: TCP
- Source type: Custom
- Source: 0.0.0.0/0
- Description: stream_server_tcp-private

Inbound Rule 4:
- Port range: 3000
- Type: Custom TCP
- Protocol: TCP
- Source type: Custom
- Source: 0.0.0.0/0
- Description: stream_server-private

Inbound Rule 5:
- Port range: 4000
- Type: Custom TCP
- Protocol: TCP
- Source type: Custom
- Source: 0.0.0.0/0
- Description: state_server-private

Inbound Rule 6:
- Port range: 8080
- Type: Custom TCP
- Protocol: TCP
- Source type: Custom
- Source: 0.0.0.0/0
- Description: examples-private

Security group 2: For exposed load balancer

Inbound Rule 1:
- Port range: 443
- Type: HTTPS
- Protocol: TCP
- Source type: Custom
- Source: 0.0.0.0/0
- Description: examples-public

Inbound Rule 2:
- Port range: 2000 - 2100
- Type: Custom UDP
- Protocol: UDP
- Source type: Custom
- Source: 0.0.0.0/0
- Description: stream_server_udp-public

Inbound Rule 3:
- Port range: 2000 - 2100
- Type: Custom TCP
- Protocol: TCP
- Source type: Custom
- Source: 0.0.0.0/0
- Description: stream_server_tcp-public

Inbound Rule 4:
- Port range: 3000
- Type: Custom TCP
- Protocol: TCP
- Source type: Custom
- Source: 0.0.0.0/0
- Description: stream_server-public

Inbound Rule 5:
- Port range: 4000
- Type: Custom TCP
- Protocol: TCP
- Source type: Custom
- Source: 0.0.0.0/0
- Description: state_server-public

TODO: Revisit Sources for security

### Launch an EC2 instance

1. Create and download key pair
2. Launch a new EC2 instance with the key pair

Note: If you want to use a
[free tier EC2 instance (t2.micro or t3.micro depending on regions)](https://aws.amazon.com/free/)
for trial. Increase the storage size to miximum capacity for free (30GB SSD).

3. Associate Security group 1.
4. Remember the EC2 instance Public IPv4 DNS

### Create a load balancer

- Load balancer type: Network
- Associate Security group 2

### Setup hosted zone and certificate

Create Hosted zone from Route 53

- Domain name: Your domain
- Type: Public hosted zone

Create a record on the hosted zone you created

- Record: Your domain
- Alias: On
  - Alias to Network Load Balancer
  - Region: Choose the region of the load balancer
  - Load balancer: Choose the load balancer you created

Request certificate via AWS Certificate Manager (ACM)

- Certificate type: Public certificate type
- Domain name: Your domain
- Validation method: Choose the preferred one and follow the instruction
- Key algorithm: RSA 2048 (or preferred one)

### Create and associate target groups

Create target groups to the instance, create listeners on the load balancer,
and associate them.

Target group 1:
- Target type: Instance
- Target group name: examples
- Protocol and port: TCP 8080
- IP address type: IPv4
- Health check protocol: TCP
- Target instance: The instance you launched

Listener 1:
- Protocol and Port: TLS 443
- Security policy: Choose a recommended one
- Certificate Source: From ACM
- Certificate (from ACM): Choose the one you requested
- ALPN policy: None
- Load balancer: The load balancer you created
- Forward to target group: Target group1

Target group 2:
- Target type: Instance
- Target group name: stream-server
- Protocol and port: TCP 3000
- IP address type: IPv4
- Health check protocol: TCP
- Target instance: The instance you launched

Listener 2:
- Protocol and Port: TLS 3000
- Security policy: Choose a recommended one
- Certificate Source: From ACM
- Certificate (from ACM): Choose the one you requested
- ALPN policy: None
- Load balancer: The load balancer you created
- Forward to target group: Target group2

Target group 3:
- Target type: Instance
- Target group name: state-server
- Protocol and port: TCP 4000
- IP address type: IPv4
- Health check protocol: TCP
- Target instance: The instance you launched

Listener 3:
- Protocol and Port: TLS 4000
- Security policy: Choose a recommended one
- Certificate Source: From ACM
- Certificate (from ACM): Choose the one you requested
- ALPN policy: None
- Load balancer: The load balancer you created
- Forward to target group: Target group3

Target group 4:
- Target type: Instance
- Target group name: tcp-udp2000
- Protocol and port: TCP_UDP 2000
- IP address type: IPv4
- Health check protocol: TCP
- Health check port: 3000
- Target instance: The instance you launched

Listener 4:
- Protocol and Port: TCP_UDP 2000
- Load balancer: The load balancer you created
- Forward to target group: Target group4

Target group 5:
- Target type: Instance
- Target group name: tcp-udp2001
- Protocol and port: TCP_UDP 2001
- IP address type: IPv4
- Health check protocol: TCP
- Health check port: 3000
- Target instance: The instance you launched

Listener 5:
- Protocol and Port: TCP_UDP 2001
- Load balancer: The load balancer you created
- Forward to target group: Target group5

Apply the same configuration to any number of consecutive ports,
up to a maximum of 2100.

TODO: Automatically setup target groups and listeners because
manually setting up for many ports is bothering.

### Login to EC2 instance

Copy the downloaded key pair file (called `foo.pem` here) to `~/.ssh`.

```sh
$ cp Downloads/foo.pem ~/.ssh/
```

Login to the instance by using the EC2 instance public domain name
(called `ec2-01-234-567-890.ap-northeast-1.compute.amazonaws.com` here).

```sh
$ ssh -i ~/.ssh/foo.pem ec2-user@ec2-01-234-567-890.ap-northeast-1.compute.amazonaws.com
```

### Install Docker

```sh
$ sudo dnf update
$ sudo dnf install docker
$ sudo systemctl enable --now docker
$ sudo usermod -aG docker ec2-user
$ id

# Exit and login again
$ exit
$ ssh -i ~/.ssh/foo.pem ec2-user@ec2-01-234-567-890.ap-northeast-1.compute.amazonaws.com

$ docker info
```

### Install Docker compose

```sh
$ sudo mkdir -p /usr/local/lib/docker/cli-plugins/
$ sudo curl -SL https://github.com/docker/compose/releases/download/v2.22.0/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
$ sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```

Find the latest or preferred package version from https://github.com/docker/compose/releases/

### Install Git

```sh
$ sudo dnf install git
```

### Optional: Setup Swap space

Consider to setup swap space if using low memory instance like free tier instances
(t2.micro or t3.micro).

```sh
$ sudo dd if=/dev/zero of=/swapfile bs=1M count=4096
$ sudo chmod 600 /swapfile
$ sudo mkswap /swapfile
$ sudo swapon /swapfile
$ sudo swapon -s
$ vi /etc/fstab
# Add /swapfile swap swap defaults 0 0
```

### Run the project

Prerequirements:
- Know the IP address of your domain name
(eg: with `Linux dig command` or [DNS lookup web sites](https://www.nslookup.io/))

TODO: IP address can change, for example when rebooting the instance. Use Elastic IP?

```sh
$ git clone https://github.com/takahirox/tiny-web-metaverse.git
$ cd tiny-web-metaverse
$ MEDIASOUP_ANNOUNCED_IP=your_ip_address docker compose up
```

Access https:// + your domain name (ex: https://yourdomain.com if your domain name
is "yourdomain.com") on web browser when the programs start.

### Running cost estimation

T.B.D.

## Deploy Demo to Google Cloud

T.B.D.

## How to support the project

* Test and [Report bugs](https://github.com/takahirox/tiny-web-metaverse/issues)
* [Make Pull requests](https://github.com/takahirox/tiny-web-metaverse/pulls) to fix bugs or add new features
* Monthly or one-time support via GitHub sponsors: T.B.D.
* Make a support contract: T.B.D.
