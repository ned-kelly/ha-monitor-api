#!/bin/bash

# Please refer to the following URL for further details re multi-architecture docker builds:
#       https://billglover.me/2018/10/30/multi-architecture-docker-builds/

# Setup multi-architecture docker..
docker manifest create bushrangers/ha-monitor-api \
    bushrangers/ha-monitor-api:arm32v6 \
    bushrangers/ha-monitor-api:arm64v8 \
    bushrangers/ha-monitor-api:amd64

docker manifest push bushrangers/ha-monitor-api:latest