defmodule Server.Component do
  use Ecto.Schema
  import Ecto.Changeset

  schema "components" do
    field :component_name, :string
    field :creator, :string
    field :data, :string
    field :network_id, :string
    field :owner, :string
    field :removed, :boolean, default: false

    timestamps()
  end

  @doc false
  def changeset(component, attrs) do
    component
    |> cast(attrs, [:component_name, :creator, :owner, :network_id, :data, :removed])
    |> validate_required([:component_name, :creator, :owner, :network_id, :data, :removed])
    |> unique_constraint([:component_name, :network_id])
  end
end
