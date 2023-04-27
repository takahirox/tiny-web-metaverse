defmodule Server.Entity do
  use Ecto.Schema
  import Ecto.Changeset

  schema "entities" do
    field :creator, :string
    field :network_id, :string
    field :prefab, :string
    field :prefab_params, :string
    field :room_id, :string
    field :shared, :boolean, default: false
    field :version, :integer, default: 1

    timestamps()
  end

  @doc false
  def changeset(entity, attrs) do
    entity
    |> cast(attrs, [:network_id, :creator, :shared, :prefab, :prefab_params, :room_id])
    |> validate_required([:network_id, :creator, :shared, :prefab, :prefab_params, :room_id])
    |> unique_constraint(:network_id)
  end
end
