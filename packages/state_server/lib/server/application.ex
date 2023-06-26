defmodule Server.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the Telemetry supervisor
      ServerWeb.Telemetry,
      # Start the Ecto repository
      Server.Repo,
      # Start the PubSub system
      {Phoenix.PubSub, name: Server.PubSub},
      # Start Finch
      {Finch, name: Server.Finch},
      # Start the Endpoint (http/https)
      ServerWeb.Endpoint
      # Start a worker by calling: Server.Worker.start_link(arg)
      # {Server.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Server.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    ServerWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
