import { Channel, Socket } from "phoenix";

// TODO: Avoid any
type Callback = (payload?: any) => void;

export class StateAdapter {	
  private channel: Channel;
  // Expects one listener per one event
  private eventListenerMap: Map<string, number>;
  readonly userId: string;

  constructor(params: {
    roomId: string,
    url?: string,
    userId: string,
    username?: string
  }) {
    const url = params.url || `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:4000/socket`;
    const topic = `room:${params.roomId}`;
    const username = params.username || 'anonymous';
    this.userId = params.userId;

    const socket = new Socket(url, {});
    socket.connect();

    // TODO: Resolve user id conflicts. Generate UUID in server side?
    this.channel = socket.channel(topic, {user_id: this.userId, username});
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
  // TODO: Check the completion if possible?
  push(name: string, data: any): void {
    this.channel.push(name, data);
  }
}
