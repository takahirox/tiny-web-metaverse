defmodule Server.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :removed, :boolean, default: false
    field :user_id, :string

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:user_id, :removed])
    |> validate_required([:user_id, :removed])
    |> unique_constraint(:user_id)
  end
end
