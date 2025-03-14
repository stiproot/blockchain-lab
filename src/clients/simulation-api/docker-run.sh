#!/bin/sh

docker build -f Dockerfile -t img-blockchain-proxy-api-$1 .
docker run --name blockchain-proxy-api-$1 -p 3001:3002 -it --detach img-blockchain-proxy-api-$1
docker exec -it blockchain-proxy-api-$1 sh
