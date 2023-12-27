# syntax=docker/dockerfile:1

FROM node:latest
WORKDIR /demo
COPY . .
RUN npm install
RUN npm run install:demo
WORKDIR /demo/packages/demo
CMD npm run build && \
    npm run server
