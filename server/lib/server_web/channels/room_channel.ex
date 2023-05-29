defmodule ServerWeb.RoomChannel do
  use Phoenix.Channel

  def join("room:lobby", payload, socket) do
    case Server.Repo.insert(
      %Server.User{
        user_id: payload["user_id"],
        removed: false
      },
      on_conflict: :raise
	) do
      {:ok, res} ->
        send(self(), {:after_join, res.id})
        {:ok, assign(socket, :user_id, payload["user_id"])}
      # TODO: Proper error handling
      {:error, _changeset} ->
        {:error, %{reason: "Failed to join"}}
    end
  end

  # TODO: Support per room processing
  def join("room:" <> _private_room_id, _payload, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  # TODO: Properer leave processing
  def terminate(_reason, socket) do
    # TODO: When to delete a row?
    case Server.Repo.insert(
      %Server.User{user_id: socket.assigns.user_id, removed: true},
      on_conflict: {:replace_all_except, [:inserted_at]},
      conflict_target: :user_id
    ) do
      {:ok, res} ->
        broadcast!(socket, "user_left", %{
          data: socket.assigns.user_id,
          version: res.id
        })
      # TODO: Proper error handling
      {:error, _changeset} ->
        IO.puts("Failed to leave")
    end
  end

  def handle_info({:after_join, version}, socket) do
    # TODO: Error handling
    broadcast!(socket, "user_joined", %{
      data: socket.assigns.user_id,
      version: version
    })

    import Ecto.Query, only: [from: 2]

    from(e in Server.Entity,
      where: e.removed == false,
      select: [e.creator, e.network_id, e.prefab, e.shared, e.id]
    )
     |> Server.Repo.all
     |> Enum.each(fn res ->
          # TODO: Merge rows and push once
          push(socket, "create_entity", %{
            data: %{
              creator: Enum.at(res, 0),
              network_id: Enum.at(res, 1),
              prefab: Enum.at(res, 2),
              shared: Enum.at(res, 3)
            },
            version: Enum.at(res, 4)
          })
        end)

    {:noreply, socket}
  end

  # TODO: Implement properly
  def handle_in("update_component", payload, socket) do
    Enum.each(payload["components"], fn c ->
      case Server.Repo.insert(
        %Server.Component{
          component_name: c["name"],
          creator: socket.assigns.user_id,
          data: c["data"],
          network_id: payload["network_id"],
          owner: socket.assigns.user_id,
          removed: false
        },
        on_conflict: {:replace_all_except, [:inserted_at]},
        conflict_target: [:component_name, :network_id]
      ) do
        {:ok, res} ->
          broadcast!(socket, "update_component", %{
            data: %{
              component_name: c["name"],
              creator: socket.assigns.user_id,
              data: c["data"],
              network_id: payload["network_id"],
              owner: socket.assigns.user_id,
              removed: false
            },
            version: res.id
          })
        # TODO: Proper error handling
        {:error, _changeset} -> IO.puts("error")
      end
    end)
    {:noreply, socket}
  end

  # TODO: Implement properly
  def handle_in("create_entity", payload, socket) do
    case Server.Repo.insert(
      %Server.Entity{
        creator: socket.assigns.user_id,
        network_id: payload["network_id"],
        prefab: payload["prefab"],
        removed: false,
        shared: payload["shared"]
      },
      on_conflict: :raise
	) do
      {:ok, res} ->
        broadcast!(socket, "create_entity", %{
          data: %{
            creator: res.creator,
            network_id: res.network_id,
            prefab: res.prefab,
            shared: res.shared            
          },
          version: res.id
        })
        Enum.each(payload["components"], fn c ->
          case Server.Repo.insert(
            %Server.Component{
              component_name: c["name"],
              creator: socket.assigns.user_id,
              data: c["data"],
              network_id: payload["network_id"],
              owner: socket.assigns.user_id,
              removed: false
            },
            on_conflict: :raise
          ) do
            {:ok, res} ->
              broadcast!(socket, "update_component", %{
                data: %{
                  component_name: c["name"],
                  creator: socket.assigns.user_id,
                  data: c["data"],
                  network_id: payload["network_id"],
                  owner: socket.assigns.user_id,
                  removed: false
                },
                version: res.id
              })
            # TODO: Proper error handling
            {:error, _changeset} -> IO.puts("error")
          end
		end)
      # TODO: Proper error handling
      {:error, _changeset} -> IO.puts("error")
    end
    {:noreply, socket}
  end

  # TODO: Implement properly
  def handle_in("remove_entity", payload, socket) do
    case Server.Repo.insert(
      %Server.Entity{
        creator: socket.assigns.user_id,
        network_id: payload["network_id"],
        prefab: payload["prefab"],
        removed: true,
        shared: payload["shared"]
      },
      on_conflict: {:replace_all_except, [:inserted_at]},
      conflict_target: :network_id
	) do
      {:ok, res} ->
        broadcast!(socket, "remove_entity", %{
          data: %{
            creator: res.creator,
            network_id: res.network_id,
            shared: res.shared            
          },
          version: res.id
        })
      # TODO: Proper error handling
      {:error, _changeset} -> IO.puts("error")
    end
    {:noreply, socket}
  end
end
