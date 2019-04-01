# A lightweight API that exposes the system's current performance (such as disk, network, cpu/temperature etc)

FROM node:8-alpine

WORKDIR /opt/monitor-api
COPY src/ /opt/monitor-api

RUN cd /opt/monitor-api && \
    apk update && apk add curl && \
    npm install --only=prod

# Use in conjunction with Docker "Autoheal" -- https://hub.docker.com/r/willfarrell/autoheal/
HEALTHCHECK --interval=5s --timeout=10s --retries=3 CMD curl -sS 127.0.0.1:9999 || exit 1

# Start CMD
ENTRYPOINT ["/opt/monitor-api/entrypoint.sh"]