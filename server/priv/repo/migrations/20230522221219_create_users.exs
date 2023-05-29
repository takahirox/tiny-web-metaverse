defmodule Server.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users) do
      add :user_id, :string
      add :removed, :boolean, default: false, null: false

      timestamps()
    end

    create unique_index(:users, [:user_id])
  end
end
