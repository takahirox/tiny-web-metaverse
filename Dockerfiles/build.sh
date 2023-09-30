#/bin/bash

docker build -t tiny-web-metaverse-examples --file Dockerfiles/examples.Dockerfile .
docker build -t tiny-web-metaverse-state_server --file Dockerfiles/state_server.Dockerfile .
docker build -t tiny-web-metaverse-stream_server --file Dockerfiles/stream_server.Dockerfile .
