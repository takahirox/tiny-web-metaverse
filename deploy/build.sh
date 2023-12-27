#/bin/bash

docker build -t tiny-web-metaverse-demo --file deploy/Dockerfiles/demo.Dockerfile .
docker build -t tiny-web-metaverse-state_server --file deploy/Dockerfiles/state_server.Dockerfile .
docker build -t tiny-web-metaverse-stream_server --file deploy/Dockerfiles/stream_server.Dockerfile .
