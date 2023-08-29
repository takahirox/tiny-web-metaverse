# syntax=docker/dockerfile:1

FROM node:latest
WORKDIR /stream_server
COPY . .
RUN npm install
RUN npm run install:stream_server
WORKDIR /stream_server/packages/stream_server
CMD npm run build && \
    npm run server
