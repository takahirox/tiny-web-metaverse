# syntax=docker/dockerfile:1

FROM node:latest
WORKDIR /examples
COPY . .
RUN npm install
RUN npm run install:examples
WORKDIR /examples/packages/examples
CMD npm run build && \
    npm run server
