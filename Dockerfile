# base image
FROM nginx:latest

# install jq to get version
RUN apk add jq

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# copy artifact build from the 'build environment'
COPY . /usr/share/nginx/html

# create and copy version
RUN mkdir -p /usr/share/nginx/version/
RUN echo "$(jq -r '.version' /usr/share/nginx/html/package.json)" > /usr/share/nginx/version/version.txt

# copy nginx conf
COPY nginx.conf /etc/nginx/conf.d/nginx.conf

# expose port 80
EXPOSE 80

# When the container starts, replace the env.js with values from environment variables
CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/js/env.template.js > /usr/share/nginx/html/js/env.js && exec nginx -g 'daemon off;'"]
