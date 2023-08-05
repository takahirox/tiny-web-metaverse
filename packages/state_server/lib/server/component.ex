defmodule Server.Component do
  use Ecto.Schema
  import Ecto.Changeset

  schema "components" do
    field :component_name, :string
    field :creator, :string
    field :data, :string
    field :network_id, :string
    field :owner, :string
    field :room_id, :string
    field :version, :integer, default: 1
    # TODO: Add component_id (UUID)?

    timestamps()
  end

  @doc false
  def changeset(component, attrs) do
    component
    |> cast(attrs, [:component_name, :creator, :owner, :network_id, :room_id, :data])
    |> validate_required([:component_name, :creator, :owner, :network_id, :room_id, :data])
    |> unique_constraint([:component_name, :network_id])
  end
end
