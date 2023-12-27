#/bin/bash

PRIVATE_IP=$(./deploy/get_ip.sh)

if [ $? -ne 0 ]; then
  exit 1
fi

MEDIASOUP_ANNOUNCED_IP=${PRIVATE_IP} docker compose up -d
