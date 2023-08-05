defmodule Server.Repo.Migrations.CreateEntities do
  use Ecto.Migration

  def change do
    create table(:entities) do
      add :network_id, :string
      add :creator, :string
      add :shared, :boolean, default: false, null: false
      add :prefab, :string
      add :prefab_params, :text
      add :room_id, :string
      add :version, :integer, default: 1

      timestamps()
    end

    create unique_index(:entities, [:network_id])
  end
end
