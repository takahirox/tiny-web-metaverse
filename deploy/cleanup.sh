#/bin/bash

docker compose down
docker container prune -f
docker image prune -f -a
docker volume prune -f -a
docker system prune -f -a
