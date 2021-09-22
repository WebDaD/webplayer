#!/bin/bash

docker build -t webplayer:latest . 

docker stop webplayer || :

docker rm webplayer || :

docker run \
--env API="${WP_API}" \
--name webplayer \
--restart unless-stopped \
-p "${WP_PORT}":80 \
-d webplayer:latest
