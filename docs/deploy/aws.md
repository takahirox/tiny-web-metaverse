# Deploy Demo to AWS ECS with Docker

TODO: Use AWS cloud formation for easier deployment? [#38](https://github.com/takahirox/tiny-web-metaverse/issues/38)

Prerequirements:

* Get your own domain name (eg: [Amazon Route 53](https://aws.amazon.com/getting-started/hands-on/get-a-domain/))
* [Make an AWS account](https://aws.amazon.com/)
* [Login to AWS Management console](https://aws.amazon.com/console/)

## Create security groups

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

## Launch an EC2 instance

1. Create and download key pair
2. Launch a new EC2 instance with the key pair and AMI 2023

Note: If you want to use a
[free tier EC2 instance (t2.micro or t3.micro depending on regions)](https://aws.amazon.com/free/)
for trial. Increase the storage size to miximum capacity for free (30GB SSD).

3. Associate Security group 1.
4. Remember the EC2 instance Public IPv4 DNS

## Create a load balancer

- Load balancer type: Network
- Associate Security group 2

## Setup hosted zone and certificate

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

## Create and associate target groups

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

## Login to EC2 instance

Copy the downloaded key pair file (called `foo.pem` here) to `~/.ssh`.

```sh
$ cp Downloads/foo.pem ~/.ssh/
```

Login to the instance by using the EC2 instance public domain name
(called `ec2-01-234-567-890.ap-northeast-1.compute.amazonaws.com` here).

```sh
$ ssh -i ~/.ssh/foo.pem ec2-user@ec2-01-234-567-890.ap-northeast-1.compute.amazonaws.com
```

## Install Docker

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

## Install Docker compose

```sh
$ sudo mkdir -p /usr/local/lib/docker/cli-plugins/
$ sudo curl -SL https://github.com/docker/compose/releases/download/v2.22.0/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
$ sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```

Find the latest or preferred package version from https://github.com/docker/compose/releases/

## Install Git

```sh
$ sudo dnf install git
```

## Optional: Setup Swap space

Consider to setup swap space if using low memory instance like free tier instances
(t2.micro or t3.micro).

```sh
$ sudo dd if=/dev/zero of=/swapfile bs=1M count=4096
$ sudo chmod 600 /swapfile
$ sudo mkswap /swapfile
$ sudo swapon /swapfile
$ sudo swapon -s
$ sudo vi /etc/fstab
# Add /swapfile swap swap defaults 0 0
```

## Run the project

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

## Running cost estimation

T.B.D.
