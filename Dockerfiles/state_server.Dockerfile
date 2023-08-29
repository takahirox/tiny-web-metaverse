# syntax=docker/dockerfile:1
ARG ALPINE_VERSION=3.18.2
ARG ELIXIR_VERSION=1.14.5
ARG ERLANG_VERSION=25.3.2.5

FROM hexpm/elixir:${ELIXIR_VERSION}-erlang-${ERLANG_VERSION}-alpine-${ALPINE_VERSION}

WORKDIR /state_server

COPY . .
WORKDIR /state_server/packages/state_server
RUN mix local.hex --force
RUN mix local.rebar --force

RUN apk add --no-cache \
  # required by hex:phoenix_live_reload \
  inotify-tools

CMD mix deps.get && \
    mix deps.compile && \
    mix ecto.create && \
    mix ecto.migrate && \
    mix phx.server
