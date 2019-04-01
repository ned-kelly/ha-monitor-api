# A lightweight API that exposes the system's current performance (such as disk, network, cpu/temperature etc)

FROM node:8-alpine

WORKDIR /opt/monitor-api
COPY src/ /opt/monitor-api

RUN npm install && \
    npm install forever -g

# Use in conjunction with Docker "Autoheal" -- https://hub.docker.com/r/willfarrell/autoheal/
HEALTHCHECK --interval=5s --timeout=10s --retries=3 CMD curl -sS 127.0.0.1:9999 || exit 1

# Start CMD
CMD ["forever", "server.js"]
