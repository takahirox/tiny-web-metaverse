defmodule Server.Repo.Migrations.CreateComponents do
  use Ecto.Migration

  def change do
    create table(:components) do
      add :component_name, :string
      add :creator, :string
      add :network_id, :string
      add :owner, :string
      add :room_id, :string
      add :data, :text
      add :version, :integer, default: 1

      timestamps()
    end

    create unique_index(:components, [:component_name, :network_id])
  end
end
