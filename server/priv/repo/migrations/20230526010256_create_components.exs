defmodule Server.Repo.Migrations.CreateComponents do
  use Ecto.Migration

  def change do
    create table(:components) do
      add :component_name, :string
      add :creator, :string
      add :owner, :string
      add :network_id, :string
      add :data, :text
      add :removed, :boolean, default: false, null: false

      timestamps()
    end

    create unique_index(:components, [:component_name, :network_id])
  end
end
