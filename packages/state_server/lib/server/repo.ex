defmodule Server.Repo do
  use Ecto.Repo,
    otp_app: :server,
    adapter: Ecto.Adapters.Postgres
end
