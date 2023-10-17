# tiny-web-metaverse

Tiny Web Metaverse project is for open, simple, easy, hostable, flexible, and
extensible 3D virtual space platform for the web.

## Online Demo

[Online Demo](https://tiny-web-metaverse.net)

Click to enter a room, and then share the URL (with `?room_id=xxx`) with your friends
to meet up with in a room.

## Screenshot

T.B.D.

## Features

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
