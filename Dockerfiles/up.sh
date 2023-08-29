#/bin/bash

case $(uname -a) in
  *MINGW*)
  # Get the first IPv4 address of Ethernet but not sure if it's a robust way
  # to get the private ip address
  # TODO: Improve and more robust
    PRIVATE_IP=$(ipconfig | grep -A7 "Ethernet" | grep IPv4 | head -1 | perl -nle '/([0-9]+\.[0-9]+\.[0-9]+\.[0-9])/; print $1'
)
    ;;

  # Assume Linux/Unix
  *)
    PRIVATE_IP=$(hostname -I)
    ;;
esac

if [[ $PRIVATE_IP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  MEDIASOUP_ANNOUNCED_IP=${PRIVATE_IP} docker compose up -d
else
  echo Failed to detect private IP
fi
