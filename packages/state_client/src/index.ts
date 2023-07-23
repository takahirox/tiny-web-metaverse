import { Channel, Socket } from "phoenix";

export enum MessageType {
  AddComponent = 'add_component',
  CreateEntity = 'create_entity',
  RemoveEntity = 'remove_entity',
  RemoveComponent = 'remove_component',
  TextMessage = 'text_message',
  UpdateComponent = 'update_component',
  UserJoined = 'user_joined',
  UserLeft = 'user_left',
  UserList = 'user_list'
};

// TODO: Avoid any
type Callback = (payload?: any) => void;

export class Adapter {	
  private channel: Channel;
  // Expects one listener per one event
  private eventListenerMap: Map<string, number>;
  readonly userId: string;

  constructor(params: {
    topic?: string,
    url?: string,
    userId: string
  }) {
    const url = params.url || 'ws://localhost:4000/socket';
    const topic = params.topic || 'room:lobby';
    this.userId = params.userId;

    const socket = new Socket(url, {});
    socket.connect();

    // TODO: Resolve user id conflicts. Generate UUID in server side?
    this.channel = socket.channel(topic, {user_id: this.userId});
    this.channel.join()
      .receive('ok', res => {
        console.log('Adapter: Joined successfully', res);
      })
      .receive('error', res => {
        // TODO: Proper error handling
        console.error('Adapter: Unable to join', res);
      })

    this.eventListenerMap = new Map();
  }

  addEventListener(name: string, callback: Callback): void {
    if (this.eventListenerMap.has(name)) {
      // TODO: Error handling
      return;
    }
    const ref = this.channel.on(name, callback);
    this.eventListenerMap.set(name, ref);
  }

  removeEventListener(name: string): void {
    if (!this.eventListenerMap.has(name)) {
      // TODO: Error handling
      return;
    }
    const ref = this.eventListenerMap.get(name);
    this.channel.off(name, ref);
    this.eventListenerMap.delete(name);
  }

  // TODO: Avoid any
  push(name: string, data: any): void {
    this.channel.push(name, data);
  }
}
