#/bin/bash

docker compose down
docker image rm $(docker images -a -q)
docker volume rm $(docker volume ls -q)
docker system prune -f -a
