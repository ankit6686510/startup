import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';

export interface WebSocketUser {
  id: string;
  email: string;
  role: string;
  rooms: string[];
}

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  userId?: string;
  room?: string;
}

export interface WebSocketConfig {
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
  jwt: {
    secret: string;
  };
  rateLimiting?: {
    maxConnections: number;
    maxEventsPerSecond: number;
  };
}

export class WebSocketServer {
  private io: SocketIOServer;
  private redis?: Redis;
  private config: WebSocketConfig;
  private connectedUsers: Map<string, WebSocketUser> = new Map();
  private userSockets: Map<string, Set<string>> = new Map();
  private rateLimiters: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(httpServer: HTTPServer, config: WebSocketConfig) {
    this.config = config;

    // Initialize Socket.IO server
    this.io = new SocketIOServer(httpServer, {
      cors: config.cors,
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupRedisAdapter();
    this.setupMiddleware();
    this.setupEventHandlers();
    this.startCleanupInterval();
  }

  private async setupRedisAdapter(): Promise<void> {
    if (this.config.redis) {
      try {
        const pubClient = new Redis({
          host: this.config.redis.host,
          port: this.config.redis.port,
          password: this.config.redis.password,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
        });

        const subClient = pubClient.duplicate();

        this.redis = pubClient;
        this.io.adapter(createAdapter(pubClient, subClient));

        console.log('✅ Redis adapter configured for WebSocket scaling');
      } catch (error) {
        console.error('❌ Failed to setup Redis adapter:', error);
      }
    }
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token =
          socket.handshake.auth.token ||
          socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, this.config.jwt.secret) as any;

        // Attach user info to socket
        socket.userId = decoded.userId || decoded.id;
        socket.userEmail = decoded.email;
        socket.userRole = decoded.role || 'user';

        // Rate limiting check
        if (!this.checkRateLimit(socket.userId)) {
          return next(new Error('Rate limit exceeded'));
        }

        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });

    // Connection limiting middleware
    this.io.use((socket, next) => {
      const userConnections = this.userSockets.get(socket.userId)?.size || 0;
      const maxConnections = this.config.rateLimiting?.maxConnections || 5;

      if (userConnections >= maxConnections) {
        return next(new Error('Maximum connections exceeded'));
      }

      next();
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: any): void {
    const userId = socket.userId;
    const userEmail = socket.userEmail;
    const userRole = socket.userRole;

    console.log(`🔌 User connected: ${userEmail} (${socket.id})`);

    // Track user connection
    this.connectedUsers.set(socket.id, {
      id: userId,
      email: userEmail,
      role: userRole,
      rooms: [],
    });

    // Track user sockets
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socket.id);

    // Join user to their personal room
    socket.join(`user:${userId}`);

    // Join user to role-based room
    socket.join(`role:${userRole}`);

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to StartupCompass real-time service',
      userId,
      timestamp: Date.now(),
    });

    // Broadcast user online status to relevant rooms
    this.broadcastUserStatus(userId, 'online');

    // Handle room joining
    socket.on('join_room', (data: { room: string }) => {
      this.handleJoinRoom(socket, data.room);
    });

    // Handle room leaving
    socket.on('leave_room', (data: { room: string }) => {
      this.handleLeaveRoom(socket, data.room);
    });

    // Handle private messages
    socket.on(
      'private_message',
      (data: { recipientId: string; message: string; type?: string }) => {
        this.handlePrivateMessage(socket, data);
      },
    );

    // Handle room messages
    socket.on('room_message', (data: { room: string; message: string; type?: string }) => {
      this.handleRoomMessage(socket, data);
    });

    // Handle typing indicators
    socket.on('typing_start', (data: { room?: string; recipientId?: string }) => {
      this.handleTypingStart(socket, data);
    });

    socket.on('typing_stop', (data: { room?: string; recipientId?: string }) => {
      this.handleTypingStop(socket, data);
    });

    // Handle job application notifications
    socket.on('subscribe_job_alerts', (data: { filters: any }) => {
      this.handleJobAlertSubscription(socket, data.filters);
    });

    // Handle startup updates
    socket.on('subscribe_startup_updates', (data: { startupIds: string[] }) => {
      this.handleStartupSubscription(socket, data.startupIds);
    });

    // Handle funding notifications
    socket.on('subscribe_funding_updates', (data: { filters: any }) => {
      this.handleFundingSubscription(socket, data.filters);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      this.handleDisconnection(socket, reason);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`WebSocket error for user ${userEmail}:`, error);
    });
  }

  private handleJoinRoom(socket: any, room: string): void {
    // Validate room access
    if (!this.canJoinRoom(socket, room)) {
      socket.emit('error', { message: 'Access denied to room', room });
      return;
    }

    socket.join(room);

    const user = this.connectedUsers.get(socket.id);
    if (user) {
      user.rooms.push(room);
    }

    socket.emit('room_joined', { room, timestamp: Date.now() });
    socket.to(room).emit('user_joined_room', {
      userId: socket.userId,
      userEmail: socket.userEmail,
      room,
      timestamp: Date.now(),
    });

    console.log(`👥 User ${socket.userEmail} joined room: ${room}`);
  }

  private handleLeaveRoom(socket: any, room: string): void {
    socket.leave(room);

    const user = this.connectedUsers.get(socket.id);
    if (user) {
      user.rooms = user.rooms.filter((r) => r !== room);
    }

    socket.emit('room_left', { room, timestamp: Date.now() });
    socket.to(room).emit('user_left_room', {
      userId: socket.userId,
      userEmail: socket.userEmail,
      room,
      timestamp: Date.now(),
    });

    console.log(`👋 User ${socket.userEmail} left room: ${room}`);
  }

  private handlePrivateMessage(
    socket: any,
    data: { recipientId: string; message: string; type?: string },
  ): void {
    const message: WebSocketMessage = {
      type: data.type || 'private_message',
      payload: {
        message: data.message,
        senderId: socket.userId,
        senderEmail: socket.userEmail,
        recipientId: data.recipientId,
      },
      timestamp: Date.now(),
      userId: socket.userId,
    };

    // Send to recipient
    this.io.to(`user:${data.recipientId}`).emit('private_message', message);

    // Send confirmation to sender
    socket.emit('message_sent', {
      messageId: this.generateMessageId(),
      recipientId: data.recipientId,
      timestamp: message.timestamp,
    });

    console.log(`💬 Private message from ${socket.userEmail} to user ${data.recipientId}`);
  }

  private handleRoomMessage(
    socket: any,
    data: { room: string; message: string; type?: string },
  ): void {
    // Check if user is in the room
    if (!socket.rooms.has(data.room)) {
      socket.emit('error', { message: 'Not a member of this room', room: data.room });
      return;
    }

    const message: WebSocketMessage = {
      type: data.type || 'room_message',
      payload: {
        message: data.message,
        senderId: socket.userId,
        senderEmail: socket.userEmail,
        room: data.room,
      },
      timestamp: Date.now(),
      userId: socket.userId,
      room: data.room,
    };

    // Broadcast to room (excluding sender)
    socket.to(data.room).emit('room_message', message);

    // Send confirmation to sender
    socket.emit('message_sent', {
      messageId: this.generateMessageId(),
      room: data.room,
      timestamp: message.timestamp,
    });

    console.log(`💬 Room message from ${socket.userEmail} in room ${data.room}`);
  }

  private handleTypingStart(socket: any, data: { room?: string; recipientId?: string }): void {
    const typingData = {
      userId: socket.userId,
      userEmail: socket.userEmail,
      timestamp: Date.now(),
    };

    if (data.room) {
      socket.to(data.room).emit('user_typing_start', { ...typingData, room: data.room });
    } else if (data.recipientId) {
      this.io
        .to(`user:${data.recipientId}`)
        .emit('user_typing_start', { ...typingData, senderId: socket.userId });
    }
  }

  private handleTypingStop(socket: any, data: { room?: string; recipientId?: string }): void {
    const typingData = {
      userId: socket.userId,
      userEmail: socket.userEmail,
      timestamp: Date.now(),
    };

    if (data.room) {
      socket.to(data.room).emit('user_typing_stop', { ...typingData, room: data.room });
    } else if (data.recipientId) {
      this.io
        .to(`user:${data.recipientId}`)
        .emit('user_typing_stop', { ...typingData, senderId: socket.userId });
    }
  }

  private handleJobAlertSubscription(socket: any, filters: any): void {
    const alertRoom = `job_alerts:${this.hashFilters(filters)}`;
    socket.join(alertRoom);

    socket.emit('subscribed_job_alerts', {
      filters,
      room: alertRoom,
      timestamp: Date.now(),
    });

    console.log(`🔔 User ${socket.userEmail} subscribed to job alerts`);
  }

  private handleStartupSubscription(socket: any, startupIds: string[]): void {
    startupIds.forEach((startupId) => {
      socket.join(`startup:${startupId}`);
    });

    socket.emit('subscribed_startup_updates', {
      startupIds,
      timestamp: Date.now(),
    });

    console.log(`🏢 User ${socket.userEmail} subscribed to ${startupIds.length} startup updates`);
  }

  private handleFundingSubscription(socket: any, filters: any): void {
    const fundingRoom = `funding_updates:${this.hashFilters(filters)}`;
    socket.join(fundingRoom);

    socket.emit('subscribed_funding_updates', {
      filters,
      room: fundingRoom,
      timestamp: Date.now(),
    });

    console.log(`💰 User ${socket.userEmail} subscribed to funding updates`);
  }

  private handleDisconnection(socket: any, reason: string): void {
    const userId = socket.userId;
    const userEmail = socket.userEmail;

    console.log(`🔌 User disconnected: ${userEmail} (${reason})`);

    // Remove from connected users
    this.connectedUsers.delete(socket.id);

    // Remove from user sockets tracking
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.delete(socket.id);
      if (userSocketSet.size === 0) {
        this.userSockets.delete(userId);
        // Broadcast user offline status
        this.broadcastUserStatus(userId, 'offline');
      }
    }
  }

  // Public methods for external services to send notifications

  public sendNotificationToUser(userId: string, notification: any): void {
    this.io.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: Date.now(),
    });
  }

  public sendJobAlert(filters: any, jobData: any): void {
    const alertRoom = `job_alerts:${this.hashFilters(filters)}`;
    this.io.to(alertRoom).emit('job_alert', {
      job: jobData,
      timestamp: Date.now(),
    });
  }

  public sendStartupUpdate(startupId: string, updateData: any): void {
    this.io.to(`startup:${startupId}`).emit('startup_update', {
      startupId,
      update: updateData,
      timestamp: Date.now(),
    });
  }

  public sendFundingUpdate(filters: any, fundingData: any): void {
    const fundingRoom = `funding_updates:${this.hashFilters(filters)}`;
    this.io.to(fundingRoom).emit('funding_update', {
      funding: fundingData,
      timestamp: Date.now(),
    });
  }

  public broadcastToRole(role: string, event: string, data: any): void {
    this.io.to(`role:${role}`).emit(event, {
      ...data,
      timestamp: Date.now(),
    });
  }

  public broadcastToAll(event: string, data: any): void {
    this.io.emit(event, {
      ...data,
      timestamp: Date.now(),
    });
  }

  public getConnectedUsers(): WebSocketUser[] {
    return Array.from(this.connectedUsers.values());
  }

  public getUserConnectionCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0;
  }

  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  // Private helper methods

  private canJoinRoom(socket: any, room: string): boolean {
    // Implement room access control logic
    const userRole = socket.userRole;

    // Admin can join any room
    if (userRole === 'admin') {
      return true;
    }

    // Check room-specific permissions
    if (room.startsWith('admin:')) {
      return userRole === 'admin';
    }

    if (room.startsWith('moderator:')) {
      return ['admin', 'moderator'].includes(userRole);
    }

    if (room.startsWith('startup:')) {
      // Check if user is founder/employee of the startup
      // This would require additional database lookup
      return true; // Simplified for now
    }

    // Public rooms
    return true;
  }

  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const limit = this.rateLimiters.get(userId);
    const maxEvents = this.config.rateLimiting?.maxEventsPerSecond || 10;

    if (!limit || now > limit.resetTime) {
      this.rateLimiters.set(userId, {
        count: 1,
        resetTime: now + 1000, // 1 second window
      });
      return true;
    }

    if (limit.count >= maxEvents) {
      return false;
    }

    limit.count++;
    return true;
  }

  private broadcastUserStatus(userId: string, status: 'online' | 'offline'): void {
    // Broadcast to user's contacts/followers
    // This would require additional logic to determine relevant users
    this.io.emit('user_status_change', {
      userId,
      status,
      timestamp: Date.now(),
    });
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private hashFilters(filters: any): string {
    return Buffer.from(JSON.stringify(filters)).toString('base64').substr(0, 16);
  }

  private startCleanupInterval(): void {
    // Clean up rate limiters every minute
    setInterval(() => {
      const now = Date.now();
      for (const [userId, limit] of this.rateLimiters.entries()) {
        if (now > limit.resetTime) {
          this.rateLimiters.delete(userId);
        }
      }
    }, 60000);
  }

  public close(): void {
    this.io.close();
    if (this.redis) {
      this.redis.disconnect();
    }
  }
}

export default WebSocketServer;
