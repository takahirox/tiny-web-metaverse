#/bin/bash

docker build -t tiny-web-metaverse-examples --file deploy/Dockerfiles/examples.Dockerfile .
docker build -t tiny-web-metaverse-state_server --file deploy/Dockerfiles/state_server.Dockerfile .
docker build -t tiny-web-metaverse-stream_server --file deploy/Dockerfiles/stream_server.Dockerfile .
