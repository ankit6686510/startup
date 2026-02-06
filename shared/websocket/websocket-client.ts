import { io, Socket } from 'socket.io-client';

export interface WebSocketClientConfig {
  url: string;
  auth: {
    token: string;
  };
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export interface WebSocketEventHandler {
  event: string;
  handler: (data: any) => void;
}

export class WebSocketClient {
  private socket: Socket;
  private config: WebSocketClientConfig;
  private eventHandlers: Map<string, Set<Function>> = new Map();
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' =
    'disconnected';
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number;

  constructor(config: WebSocketClientConfig) {
    this.config = config;
    this.maxReconnectAttempts = config.reconnectionAttempts || 5;

    this.socket = io(config.url, {
      auth: config.auth,
      autoConnect: config.autoConnect !== false,
      reconnection: config.reconnection !== false,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: config.reconnectionDelay || 1000,
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.socket.on('connect', () => {
      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      this.emit('connection_state_change', { state: 'connected' });
      console.log('🔌 Connected to WebSocket server');
    });

    this.socket.on('disconnect', (reason) => {
      this.connectionState = 'disconnected';
      this.emit('connection_state_change', { state: 'disconnected', reason });
      console.log('🔌 Disconnected from WebSocket server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      this.connectionState = 'disconnected';
      this.emit('connection_error', { error: error.message });
      console.error('❌ WebSocket connection error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      this.emit('reconnected', { attemptNumber });
      console.log(`🔄 Reconnected to WebSocket server (attempt ${attemptNumber})`);
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      this.connectionState = 'reconnecting';
      this.reconnectAttempts = attemptNumber;
      this.emit('reconnect_attempt', { attemptNumber });
      console.log(`🔄 Attempting to reconnect... (${attemptNumber}/${this.maxReconnectAttempts})`);
    });

    this.socket.on('reconnect_error', (error) => {
      this.emit('reconnect_error', { error: error.message });
      console.error('❌ Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      this.connectionState = 'disconnected';
      this.emit('reconnect_failed', {});
      console.error('❌ Failed to reconnect to WebSocket server');
    });

    // Handle server events
    this.socket.on('connected', (data) => {
      this.emit('server_connected', data);
    });

    this.socket.on('notification', (data) => {
      this.emit('notification', data);
    });

    this.socket.on('private_message', (data) => {
      this.emit('private_message', data);
    });

    this.socket.on('room_message', (data) => {
      this.emit('room_message', data);
    });

    this.socket.on('user_typing_start', (data) => {
      this.emit('user_typing_start', data);
    });

    this.socket.on('user_typing_stop', (data) => {
      this.emit('user_typing_stop', data);
    });

    this.socket.on('job_alert', (data) => {
      this.emit('job_alert', data);
    });

    this.socket.on('startup_update', (data) => {
      this.emit('startup_update', data);
    });

    this.socket.on('funding_update', (data) => {
      this.emit('funding_update', data);
    });

    this.socket.on('user_status_change', (data) => {
      this.emit('user_status_change', data);
    });

    this.socket.on('room_joined', (data) => {
      this.emit('room_joined', data);
    });

    this.socket.on('room_left', (data) => {
      this.emit('room_left', data);
    });

    this.socket.on('user_joined_room', (data) => {
      this.emit('user_joined_room', data);
    });

    this.socket.on('user_left_room', (data) => {
      this.emit('user_left_room', data);
    });

    this.socket.on('message_sent', (data) => {
      this.emit('message_sent', data);
    });

    this.socket.on('error', (data) => {
      this.emit('error', data);
    });
  }

  // Connection management
  public connect(): void {
    if (this.connectionState === 'disconnected') {
      this.connectionState = 'connecting';
      this.socket.connect();
    }
  }

  public disconnect(): void {
    this.socket.disconnect();
    this.connectionState = 'disconnected';
  }

  public isConnected(): boolean {
    return this.connectionState === 'connected';
  }

  public getConnectionState(): string {
    return this.connectionState;
  }

  // Event handling
  public on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  public off(event: string, handler?: Function): void {
    if (handler) {
      this.eventHandlers.get(event)?.delete(handler);
    } else {
      this.eventHandlers.delete(event);
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // Room management
  public joinRoom(room: string): void {
    this.socket.emit('join_room', { room });
  }

  public leaveRoom(room: string): void {
    this.socket.emit('leave_room', { room });
  }

  // Messaging
  public sendPrivateMessage(recipientId: string, message: string, type?: string): void {
    this.socket.emit('private_message', {
      recipientId,
      message,
      type,
    });
  }

  public sendRoomMessage(room: string, message: string, type?: string): void {
    this.socket.emit('room_message', {
      room,
      message,
      type,
    });
  }

  // Typing indicators
  public startTyping(options: { room?: string; recipientId?: string }): void {
    this.socket.emit('typing_start', options);
  }

  public stopTyping(options: { room?: string; recipientId?: string }): void {
    this.socket.emit('typing_stop', options);
  }

  // Subscriptions
  public subscribeToJobAlerts(filters: any): void {
    this.socket.emit('subscribe_job_alerts', { filters });
  }

  public subscribeToStartupUpdates(startupIds: string[]): void {
    this.socket.emit('subscribe_startup_updates', { startupIds });
  }

  public subscribeToFundingUpdates(filters: any): void {
    this.socket.emit('subscribe_funding_updates', { filters });
  }

  // Authentication
  public updateAuth(token: string): void {
    this.socket.auth = { token };
    if (this.isConnected()) {
      this.disconnect();
      this.connect();
    }
  }
}

// React Hook for WebSocket
export function useWebSocket(config: WebSocketClientConfig) {
  const [client, setClient] = useState<WebSocketClient | null>(null);
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const wsClient = new WebSocketClient(config);

    wsClient.on('connection_state_change', (data) => {
      setConnectionState(data.state);
    });

    wsClient.on('connection_error', (data) => {
      setError(data.error);
    });

    wsClient.on('reconnected', () => {
      setError(null);
    });

    setClient(wsClient);

    return () => {
      wsClient.disconnect();
    };
  }, [config.url, config.auth.token]);

  return {
    client,
    connectionState,
    error,
    isConnected: connectionState === 'connected',
  };
}

// Utility functions for common WebSocket patterns
export const webSocketUtils = {
  /**
   * Create a typing indicator manager
   */
  createTypingManager(client: WebSocketClient, options: { room?: string; recipientId?: string }) {
    let typingTimeout: NodeJS.Timeout | null = null;
    let isTyping = false;

    return {
      startTyping() {
        if (!isTyping) {
          client.startTyping(options);
          isTyping = true;
        }

        // Clear existing timeout
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }

        // Stop typing after 3 seconds of inactivity
        typingTimeout = setTimeout(() => {
          this.stopTyping();
        }, 3000);
      },

      stopTyping() {
        if (isTyping) {
          client.stopTyping(options);
          isTyping = false;
        }

        if (typingTimeout) {
          clearTimeout(typingTimeout);
          typingTimeout = null;
        }
      },

      cleanup() {
        this.stopTyping();
      },
    };
  },

  /**
   * Create a message queue for offline scenarios
   */
  createMessageQueue(client: WebSocketClient) {
    const queue: Array<{ type: string; data: any }> = [];

    client.on('connection_state_change', (data) => {
      if (data.state === 'connected' && queue.length > 0) {
        // Send queued messages
        queue.forEach(({ type, data }) => {
          if (type === 'private_message') {
            client.sendPrivateMessage(data.recipientId, data.message, data.type);
          } else if (type === 'room_message') {
            client.sendRoomMessage(data.room, data.message, data.type);
          }
        });
        queue.length = 0; // Clear queue
      }
    });

    return {
      queuePrivateMessage(recipientId: string, message: string, type?: string) {
        if (client.isConnected()) {
          client.sendPrivateMessage(recipientId, message, type);
        } else {
          queue.push({
            type: 'private_message',
            data: { recipientId, message, type },
          });
        }
      },

      queueRoomMessage(room: string, message: string, type?: string) {
        if (client.isConnected()) {
          client.sendRoomMessage(room, message, type);
        } else {
          queue.push({
            type: 'room_message',
            data: { room, message, type },
          });
        }
      },

      getQueueSize() {
        return queue.length;
      },

      clearQueue() {
        queue.length = 0;
      },
    };
  },

  /**
   * Create a notification manager
   */
  createNotificationManager(client: WebSocketClient) {
    const notifications: Array<any> = [];
    const maxNotifications = 100;

    client.on('notification', (notification) => {
      notifications.unshift(notification);

      // Keep only the latest notifications
      if (notifications.length > maxNotifications) {
        notifications.splice(maxNotifications);
      }
    });

    return {
      getNotifications() {
        return [...notifications];
      },

      getUnreadCount() {
        return notifications.filter((n) => !n.read).length;
      },

      markAsRead(notificationId: string) {
        const notification = notifications.find((n) => n.id === notificationId);
        if (notification) {
          notification.read = true;
        }
      },

      markAllAsRead() {
        notifications.forEach((n) => (n.read = true));
      },

      clearNotifications() {
        notifications.length = 0;
      },
    };
  },
};

export default WebSocketClient;
