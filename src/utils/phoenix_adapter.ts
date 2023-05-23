import { Channel, Socket } from "phoenix";

// TODO: Avoid any
type Callback = (payload?: any) => void;

export class PhoenixAdapter {	
  private channel: Channel;
  // Expects one listener per one event
  private eventListenerMap: Map<string, number>;

  constructor(params: {
    topic?: string,
    url?: string,
    userId: string
  }) {
    const url = params.url || 'ws://localhost:4000/socket';
    const topic = params.topic || 'room:lobby';
    const userId = params.userId;

    const socket = new Socket(url, {});
    socket.connect();

    // TODO: Resolve user id conflicts. Generate UUID in server side?
    this.channel = socket.channel(topic, {user_id: userId});
    this.channel.join()
      .receive('ok', res => {
        console.log('PhoenixAdapter: Joined successfully', res);
      })
      .receive('error', res => {
        // TODO: Proper error handling
        console.error('PhoenixAdapter: Unable to join', res);
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
