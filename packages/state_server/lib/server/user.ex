defmodule Server.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :room_id, :string
    field :user_id, :string
    field :version, :integer, default: 1

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:user_id, :room_id])
    |> validate_required([:user_id, :room_id])
    |> unique_constraint(:user_id)
  end
end
