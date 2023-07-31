FROM --platform=linux/amd64 node:18.17 

WORKDIR /app

# alpine is slim and need other dependencies
# RUN apk add --no-cache --virtual .gyp python3 make g++
RUN npm install -g npm@9.8.1

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

# RUN apk del .gyp