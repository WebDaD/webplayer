# Simple Web Player

Branded for [Feierwerk](https://www.feierwerk.de/), this Player shows live data
via Sockets from an API ([turboplayer2sockets](https://hub.docker.com/r/dsigmund/turboplayer2sockets))
and plays an audio-stream

## Config and Deployment

The Config shall be done via Environment Variables:

- API: Backend Server with Sockets and REST
- STREAM_MP3_1: First mp3 Stream for the player (Default: https://live.feierwerk.de:8443/live.mp3)
- STREAM_MP3_2: Second mp3 Stream for the player (Default: http://live.feierwerk.de:8000/live.mp3)
- STREAM_OGG_1: First ogg Stream for the player (Default: https://live.feierwerk.de:8443/live.ogg)
- STREAM_OGG_2: Second ogg Stream for the player (Default: http://live.feierwerk.de:8000/live.ogg)

Deploy it with the variables.

Example

```sh
docker run \
--env API="${WP_API}" \
--name webplayer \
--restart unless-stopped \
-p "${WP_PORT}":80 \
-d webplayer:latest
```

## Build and Push

```sh
podman login docker.io
podman build --platform=linux/amd64 -t dsigmund/webplayer:0.3.27 .
podman build --platform=linux/amd64 -t dsigmund/webplayer:latest .
podman push dsigmund/webplayer:0.3.27
podman push dsigmund/webplayer:latest
```
