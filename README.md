# tiny-web-metaverse

Tiny Web Metaverse project is for simple, easy, flexible, and extensible web
3D virtual platform.

## Online Demo

[Online Demo](http://tiny-w-loadb-vriwgtomqnu3-996506576.ap-northeast-1.elb.amazonaws.com:8080)

* Unsecure severs yet [#37](https://github.com/takahirox/tiny-web-metaverse/issues/37)
* No audio support yet [#39](https://github.com/takahirox/tiny-web-metaverse/issues/39)

Note: Audio is supported on local test

## Screenshot

T.B.D.

## Features

T.B.D.

## Sub-projects

See `packages` directory.

* addons:
* client:
* examples:
* state_client:
* state_server:
* stream_client:
* stream_server:

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
* Install [Elixir](https://elixir-lang.org/)

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

## Deploy Demo to AWS ECS

T.B.D.

## Deploy Demo to Google Cloud

T.B.D.
