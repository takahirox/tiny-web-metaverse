# TODO: Validation

defmodule ServerWeb.RoomChannel do
  use Phoenix.Channel

  # A user has joined a room.
  # Adds a new row to users table and sends an :after_join process message to
  # self for remained joinning processing.
  # @params payload:
  #   - user_id: string
  def join("room:lobby", payload, socket) do
    case Server.Repo.insert(
      %Server.User{user_id: payload["user_id"]},
      on_conflict: :raise
	) do
      {:ok, _res} ->
        send(self(), :after_join)
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

  # A user has been left.
  # Removes its user row from users table, removes entity and associated
  # component rows whose creators are the left user from entities and component
  # tables, and broadcasts user_left message. Remove_entity and remove_component
  # messages are not needed to be broadcast because the clients know that
  # associated entities and components removal happens from user_left message.
  # TODO: Properer user left detection?
  def terminate(_reason, socket) do
    # Removes a user and broadcasts user_left message
    # TODO: Error handling
    # TODO: Is lock needed even for deletion?
    import Ecto.Query, only: [from: 2]
    from(
      u in Server.User,
      where: u.user_id == ^socket.assigns.user_id
    )
      |> Server.Repo.delete_all([])

    # TODO: Is version needed even for deletion?
    broadcast!(socket, "user_left", %{
      data: socket.assigns.user_id
    })

    # Removes entities the user created and associated components
    # TODO: Error handling
    from(
      e in Server.Entity, 
      where: e.creator == ^socket.assigns.user_id
    )
      |> Server.Repo.delete_all([])

    from(
      c in Server.Component,
      where: c.creator == ^socket.assigns.user_id
    )
      |> Server.Repo.delete_all([])
  end

  # A user has joined and a new row to users table has been added.
  # Broadcasts a new user's info. And sends existing networked entities info
  # to the new user's client.
  def handle_info(:after_join, socket) do
    # Broadcasts a new user's info.
    # TODO: Error handling
    broadcast!(socket, "user_joined", %{
      data: socket.assigns.user_id
    })

    # Sends existing networked entities' info to the the new user's client.
    # TODO: Merge rows and push once
    import Ecto.Query, only: [from: 2]
    from(e in Server.Entity,
      select: [e.creator, e.network_id, e.prefab, e.prefab_params, e.shared, e.version]
    )
     |> Server.Repo.all
     |> Enum.each(fn res ->
          components = 
            from(c in Server.Component,
              select: [c.component_name, c.creator, c.data, c.network_id, c.owner, c.version]
            )
              |> Server.Repo.all
              |> Enum.map(fn res ->
                   %{
                     component_name: Enum.at(res, 0),
                     creator: Enum.at(res, 1),
                     data: Enum.at(res, 2),
                     network_id: Enum.at(res, 3),
                     owner: Enum.at(res, 4),
                     version: Enum.at(res, 5)
                   }
                 end)

          push(socket, "create_entity", %{
            data: %{
              components: components,
              creator: Enum.at(res, 0),
              network_id: Enum.at(res, 1),
              prefab: Enum.at(res, 2),
              prefab_params: Enum.at(res, 3),
              shared: Enum.at(res, 4),
              version: Enum.at(res, 5)
            }
          })
        end)

    {:noreply, socket}
  end

  # Received create_entity message.
  # Adds a new row to entities table, adds associated component rows to
  # components table, and broadcasts create_entity message.
  # @params payload: {
  #   components: {
  #     data: string,
  #     name: string,
  #   }[]
  #   network_id: string,
  #   prefab: string,
  #   prefab_params: string,
  #   shared: boolean
  # }
  def handle_in("create_entity", payload, socket) do
    # Adds a new row to entities table
    case Server.Repo.insert(
      %Server.Entity{
        creator: socket.assigns.user_id,
        network_id: payload["network_id"],
        prefab: payload["prefab"],
        prefab_params: payload["prefab_params"],
        shared: payload["shared"]
      },
      on_conflict: :raise
	) do
      {:ok, res} ->
        # Adds new component rows to components table
        components = Enum.map(payload["components"], fn c ->
          case Server.Repo.insert(
            %Server.Component{
              component_name: c["name"],
              creator: socket.assigns.user_id,
              data: c["data"],
              network_id: payload["network_id"],
              owner: socket.assigns.user_id
            },
            on_conflict: :raise
          ) do
            {:ok, res} ->
              %{
                component_name: res.component_name,
                creator: res.creator,
                data: res.data,
                network_id: res.network_id,
                owner: res.owner,
                version: res.version
              }
            # TODO: Proper error handling
            {:error, _changeset} -> IO.puts("error")
          end
		end)

        # Broadcasts create_entity message
        broadcast!(socket, "create_entity", %{
          data: %{
            components: components,
            creator: res.creator,
            network_id: res.network_id,
            prefab: res.prefab,
            prefab_params: res.prefab_params,
            shared: res.shared,
            version: res.version
          }
        })
      # TODO: Proper error handling
      {:error, _changeset} -> IO.puts("error")
    end

    {:noreply, socket}
  end

  # Received update_component message.
  # Updates component info and broadcasts them.
  # @params payload: {
  #   components: {
  #     data: string,
  #     name: string,
  #   }[],
  #   network_id: string
  # }
  def handle_in("update_component", payload, socket) do
    # TODO: Lock?
    components = Enum.map(payload["components"], fn c ->
      # Updates component info
      # TODO: Error handling
      # TODO: Update updated_at?
      import Ecto.Query, only: [from: 2]
      from(
        c in Server.Component,
        where: c.component_name == ^c["name"] and
               c.network_id == ^payload["network_id"],
        update: [set: [data: ^c["data"], owner: ^socket.assigns.user_id], inc: [version: 1]]
      )
        |> Server.Repo.update_all([])

      # Broadcasts updated component info
      # TODO: Error handling
      res = from(
        c in Server.Component,
        where: c.component_name == ^c["name"] and
               c.network_id == ^payload["network_id"],
        select: [c.component_name, c.creator, c.data, c.network_id, c.owner, c.version]
      )
        |> Server.Repo.one!

      %{
        component_name: Enum.at(res, 0),
        creator: Enum.at(res, 1),
        data: Enum.at(res, 2),
        network_id: Enum.at(res, 3),
        owner: Enum.at(res, 4),
        version: Enum.at(res, 5)
      }
    end)

    broadcast!(socket, "update_component", %{
      data: %{
        components: components,
        owner: socket.assigns.user_id,
        network_id: payload["network_id"]
      }
    })

    {:noreply, socket}
  end

  # Received remove_entity message.
  # Removes an entity and associated component rows from entities and component
  # tables, and broadcasts remove_entity message. Remove_component
  # messages are not needed to be broadcast because the clients know that
  # associated components removal happens from remove_entity message.
  # @params payload: {
  #   network_id: string
  # }
  def handle_in("remove_entity", payload, socket) do
    # Removes an entity row from entities table
    # TODO: Error handling
    # TODO: Is lock needed even for deletion?
    # TODO: Is version needed even for deletion?
    import Ecto.Query, only: [from: 2]
    from(
      e in Server.Entity, 
      where: e.network_id == ^payload["network_id"]
    )
      |> Server.Repo.delete_all([])

    from(
      c in Server.Component,
      where: c.network_id == ^payload["network_id"]
    )
      |> Server.Repo.delete_all([])

    {:noreply, socket}
  end
end
