# TODO: Validation
# TODO: Transaction with Multi
# TODO: Lock if needed
# TODO: Proper error handling

defmodule ServerWeb.RoomChannel do
  use Phoenix.Channel

  # A user has joined a room.
  # Adds a new row to users table and sends an :after_join process message to
  # self for remained joinning processing.
  def join("room:" <> room_id, %{"user_id" => user_id}, socket) do
    %Server.User{
      room_id: room_id,
      user_id: user_id
    }
      |> Server.Repo.insert(on_conflict: :raise)
      |> case do
           {:ok, _res} ->
             send(self(), :after_join)
             {:ok,
               socket
                 |> assign(:room_id, room_id)
                 |> assign(:user_id, user_id)
             }
           {:error, _changeset} ->
             {:error, %{reason: "Failed to insert a user"}}
         end
  end

  # A user has been left.
  # Removes its user row from users table, removes entity and associated
  # component rows whose creators are the left user from entities and component
  # tables, and broadcasts user_left message. remove_entity and remove_component
  # messages are not needed to be broadcast because the clients know that
  # associated entities and components removal happens from user_left message.
  # TODO: Properer user left detection?
  def terminate(_reason, socket) do
    # Removes a user
    # TODO: Error handling
    # TODO: Is lock needed even for deletion?
    import Ecto.Query, only: [from: 2]
    from(
      u in Server.User,
      where: u.user_id == ^socket.assigns.user_id and
             u.room_id == ^socket.assigns.room_id
    )
      |> Server.Repo.delete_all([])

    # Removes entities the user created and associated components
    # TODO: Error handling
    from(
      e in Server.Entity, 
      where: e.creator == ^socket.assigns.user_id and
             e.room_id == ^socket.assigns.room_id
    )
      |> Server.Repo.delete_all([])

    from(
      c in Server.Component,
      where: c.creator == ^socket.assigns.user_id and
             c.room_id == ^socket.assigns.room_id
    )
      |> Server.Repo.delete_all([])

    # Broadcasts user_left message
    # TODO: Is version needed even for deletion?
    broadcast!(socket, "user_left", %{
      data: socket.assigns.user_id
    })
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

    # Sends existing networked entities' info to the new user's client.
    # TODO: Using join would be more efficient?
    import Ecto.Query, only: [from: 2]
    from(e in Server.Entity,
      select: map(e, [
        :creator,
        :network_id,
        :prefab,
        :prefab_params,
        :shared,
        :version
      ]),
      where: e.room_id == ^socket.assigns.room_id
    )
     |> Server.Repo.all()
     |> Enum.each(fn res ->
          network_id = res[:network_id]

          components = from(c in Server.Component,
            select: map(c, [
              :component_name,
              :creator,
              :data,
              :owner,
              :version
            ]),
            where: c.room_id == ^socket.assigns.room_id and
                   c.network_id == ^network_id
          )
            |> Server.Repo.all()
            |> Enum.map(fn res ->
                 %{
                   component_name: res[:component_name],
                   creator: res[:creator],
                   data: res[:data],
                   network_id: network_id,
                   owner: res[:owner],
                   version: res[:version]
                 }
               end)

          push(socket, "create_entity", %{
            data: %{
              components: components,
              creator: res[:creator],
              network_id: res[:network_id],
              prefab: res[:prefab],
              prefab_params: res[:prefab_params],
              shared: res[:shared],
              version: res[:version]
            }
          })
        end)

    {:noreply, socket}
  end

  # Received create_entity message.
  # Adds a new row to entities table, adds associated component rows to
  # components table, and broadcasts create_entity message.
  def handle_in("create_entity", %{
    #   components: {
    #     data: string,
    #     name: string
    #   }[]
    "components" => components,
    "network_id" => network_id,
    "prefab" => prefab,
    "prefab_params" => prefab_params,
    "shared" => shared
  }, socket) do
    # Adds a new row to entities table
    entity = %Server.Entity{
      creator: socket.assigns.user_id,
      network_id: network_id,
      prefab: prefab,
      prefab_params: prefab_params,
      room_id: socket.assigns.room_id,
      shared: shared
    }
      |> Server.Repo.insert(on_conflict: :raise)
      |> case do
           {:ok, res} -> res
           {:error, _changeset} -> IO.puts("Failed to insert an entity")
         end

    # Adds new component rows to components table
    components = components
      |> Enum.map(fn c ->
           %Server.Component{
             component_name: c["name"],
             creator: socket.assigns.user_id,
             data: c["data"],
             network_id: network_id,
             owner: socket.assigns.user_id,
             room_id: socket.assigns.room_id
           }
             |> Server.Repo.insert(on_conflict: :raise)
             |> case do
                  {:ok, res} ->
                    %{
                      component_name: res.component_name,
                      creator: res.creator,
                      data: res.data,
                      network_id: res.network_id,
                      owner: res.owner,
                      version: res.version
                    }
                  {:error, _changeset} ->
                    IO.puts("Failed to insert a component")
                end
         end)

    # Broadcasts create_entity message
    broadcast!(socket, "create_entity", %{
      data: %{
        components: components,
        creator: entity.creator,
        network_id: entity.network_id,
        prefab: entity.prefab,
        prefab_params: entity.prefab_params,
        shared: entity.shared,
        version: entity.version
      }
    })

    {:noreply, socket}
  end

  # Received update_component message.
  # Updates component info and broadcasts them.
  def handle_in("update_component", %{
    #   components: {
    #     data: string,
    #     name: string
    #   }[]
    "components" => components,
    "network_id" => network_id
  }, socket) do
    components = components
      |> Enum.map(fn c ->
           # Updates component info
           # TODO: Update updated_at?
           import Ecto.Query, only: [from: 2]
           from(
             c in Server.Component,
             where: c.component_name == ^c["name"] and
                    c.network_id == ^network_id and
                    c.room_id == ^socket.assigns.room_id,
             update: [
               set: [
                 data: ^c["data"],
                 owner: ^socket.assigns.user_id
               ],
               inc: [version: 1]
             ]
           )
             |> Server.Repo.update_all([])

           # Load the updated component info
           component = from(
             c in Server.Component,
             where: c.component_name == ^c["name"] and
                    c.network_id == ^network_id and
                    c.room_id == ^socket.assigns.room_id,
             select: map(c, [
               :component_name,
               :creator,
               :data,
               :network_id,
               :owner,
               :version
             ])
           )
             |> Server.Repo.one!()

           %{
             component_name: component[:component_name],
             creator: component[:creator],
             data: component[:data],
             network_id: component[:network_id],
             owner: component[:owner],
             version: component[:version]
           }
         end)

    # Broadcasts the updated components info
    broadcast!(socket, "update_component", %{
      data: %{
        components: components,
        owner: socket.assigns.user_id,
        network_id: network_id
      }
    })

    {:noreply, socket}
  end

  # Received remove_entity message.
  # Removes an entity and associated component rows from entities and component
  # tables, and broadcasts remove_entity message. remove_component
  # messages are not needed to be broadcast because the clients know that
  # associated components removal happens from remove_entity message.
  def handle_in("remove_entity", %{"network_id" => network_id}, socket) do
    # Removes an entity row from entities table
    # TODO: Is version needed even for deletion?
    import Ecto.Query, only: [from: 2]
    from(
      e in Server.Entity, 
      where: e.network_id == ^network_id and
             e.room_id == ^socket.assigns.room_id
    )
      |> Server.Repo.delete_all([])

    # Removes associated components
    from(
      c in Server.Component,
      where: c.network_id == ^network_id and
             c.room_id == ^socket.assigns.room_id
    )
      |> Server.Repo.delete_all([])

    # Broadcasts remove_entity message
    broadcast!(socket, "remove_entity", %{
      data: %{
        network_id: network_id
      }
    })

    {:noreply, socket}
  end
end
