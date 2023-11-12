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

Click to enter a room, and then share the URL (with `?room_id=xxx`) with your friends
to meet up with in a room.

## Screenshot

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

* AR/VR support with [WebXR](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)
* Mobile devices support
* Voice comunication with [WebRTC](https://webrtc.org/)
* Networked Entity state with [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
* Positional audio and audio effects with [WebAudio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

T.B.D.

## Sub-projects

This project consists of the sub projects. See `packages` directory.

* [addons](https://github.com/takahirox/tiny-web-metaverse/tree/main/packages/addons):
* [client](https://github.com/takahirox/tiny-web-metaverse/tree/main/packages/client):
* [examples](https://github.com/takahirox/tiny-web-metaverse/tree/main/packages/examples):
* [state_client](https://github.com/takahirox/tiny-web-metaverse/tree/main/packages/state_client):
* [state_server](https://github.com/takahirox/tiny-web-metaverse/tree/main/packages/state_server):
* [stream_client](https://github.com/takahirox/tiny-web-metaverse/tree/main/packages/stream_client):
* [stream_server](https://github.com/takahirox/tiny-web-metaverse/tree/main/packages/stream_server):

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

Prerequirements:

* [Make an AWS account](https://aws.amazon.com/)

### Launch an EC2 instance

1. [Login to AWS Management console](https://aws.amazon.com/console/)
2. Create and download key pair
3. Launch a new EC2 instance with the key pair

Note: If you want to use a [free tier EC2 instance (t2.micro or t3.micro depending on regions)](https://aws.amazon.com/free/)
for trial. Increase the storage size to miximum capacity for free (30GB SSD).

4. Setup a security group

Add Inbound rules

Rule 1:
- Port range: 3000
- Type: Custom TCP Rule
- Protocol: TCP
- Source: 0.0.0.0/0
- Description: stream_server

TODO: Open UDP ports when audio is supported?

Rule 2:
- Port range: 4000
- Type: Custom TCP Rule
- Protocol: TCP
- Source: 0.0.0.0/0
- Description: state_server

Rule 3:
- Port range: 8080
- Type: Custom TCP Rule
- Protocol: TCP
- Source: 0.0.0.0/0
- Description: examples

5. Remember the EC2 instance public domain name

TODO: Set up domain name

### Login to EC2 instance

Copy the downloaded key pair file (called `foo.pem` here) to `~/.ssh`.

```sh
$ cp Downloads/foo.pem ~/.ssh/
```

Login to the by using the EC2 instance public domain name (called `ec2-01-234-567-890.ap-northeast-1.compute.amazonaws.com` here).

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

```sh
$ git clone https://github.com/takahirox/tiny-web-metaverse.git
$ cd tiny-web-metaverse
$ docker compose up -d
```

## Deploy Demo to Google Cloud

T.B.D.

## How to support the project

* Test and [Report bugs](https://github.com/takahirox/tiny-web-metaverse/issues)
* [Make Pull requests](https://github.com/takahirox/tiny-web-metaverse/pulls) to fix bugs or add new features
* Monthly or one-time support via GitHub sponsors: T.B.D.
* Make a support contract: T.B.D.
