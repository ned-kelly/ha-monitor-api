#!/bin/bash

# Please refer to the following URL for further details re multi-architecture docker builds:
#       https://billglover.me/2018/10/30/multi-architecture-docker-builds/

# Setup multi-architecture docker..
docker manifest create --amend bushrangers/ha-monitor-api \
    bushrangers/ha-monitor-api:arm32v6 \
    bushrangers/ha-monitor-api:arm64v8 \
    bushrangers/ha-monitor-api:amd64

docker manifest push bushrangers/ha-monitor-api:latest

# Build with:

# docker build --no-cache -t bushrangers/ha-monitor-api:arm32v6 -f Dockerfile-arm32v6 .
# docker build --no-cache -t bushrangers/ha-monitor-api:arm64v8 -f Dockerfile-arm64v8 .
# docker build --no-cache -t bushrangers/ha-monitor-api:amd64 -f Dockerfile-amd64 .

# Push with:

# docker push bushrangers/ha-monitor-api:arm32v6
# docker push bushrangers/ha-monitor-api:arm64v8
# docker push bushrangers/ha-monitor-api:amd64