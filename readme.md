# Home Assistant - Monitoring API

Welcome to the lightweight "ha-monitor-api" project! 

This is a quick-and-dirty lightweight API _(knocked out in 30 minutes or so)_ designed to expose the system's current metrics _(such as disk, network, cpu/temperature etc)_ as a simple JSON endpoint that your Home Assistant instance can query.

It's been designed to run in a Docker Container (Ideally on your other hosts on your network - such as an external Raspberry Pi Webcam box, your Home-made weather station, or your DIY BLE/Zigbee Gateway etc - so that you can quickly feed metrics back to Home Assistant.

It does not aim to store metrics on disk, create fancy graphs etc - there's loads of other tools out there like Zabbix & Prometheus + Grafana etc - The primary goal of this tool is to expose a simple lightweight API that runs in a docker container exposing monitoring stats in real-time that can be fed into your other systems.

---------------------------------------------

**Docker Hub:** [`bushrangers/ha-monitor-api`](https://hub.docker.com/r/bushrangers/ha-monitor-api/)

![Docker Build Status](https://img.shields.io/docker/build/bushrangers/ha-monitor-api.png) ![Docker Pulls](https://img.shields.io/docker/pulls/bushrangers/ha-monitor-api.png)


## Prerequisites:

- Docker
- Docker-compose
- Linux OS that you wish to monitor (such as a RaspberryPi etc)

## Standing up:

It's pretty straightforward, just clone down the sources and stand up the container like so:

```bash
# Clone down sources on the host you want to monitor...
git clone https://github.com/ned-kelly/ha-monitor-api /opt/ha-monitor-api
cd /opt/ha-monitor-api

# Stand up the container
docker-compose up -d

```

## Integrating to Home Assistant:

\*Documentation to be updated shortly*


