# Tiny Web Metaverse State server

## How to install, build, and run

Prerequirements:

* Install [PostgreSQL](https://www.postgresql.org/)
  * Setup User/Password as postgres/postgres
* Install [Elixir](https://elixir-lang.org/)

```sh
$ mix deps.get
$ mix deps.compile
$ mix ecto.create
$ mix ecto.migrate
$ mix phx.server
```
