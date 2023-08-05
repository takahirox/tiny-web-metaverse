defmodule Server.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users) do
      add :room_id, :string
      add :user_id, :string
      add :version, :integer, default: 1, null: false

      timestamps()
    end

    create unique_index(:users, [:user_id])
  end
end
