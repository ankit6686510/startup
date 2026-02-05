import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { NotificationType, NotificationStatus } from './Notification';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export enum LogAction {
  CREATED = 'created',
  QUEUED = 'queued',
  SENT = 'sent',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  CLICKED = 'clicked',
  FAILED = 'failed',
  RETRIED = 'retried',
  CANCELLED = 'cancelled',
  BOUNCED = 'bounced',
  COMPLAINED = 'complained',
  UNSUBSCRIBED = 'unsubscribed',
}

@Entity('notification_logs')
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'notification_id' })
  @Index()
  notificationId: string;

  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId?: string;

  @Column({
    type: 'enum',
    enum: LogLevel,
  })
  @Index()
  level: LogLevel;

  @Column({
    type: 'enum',
    enum: LogAction,
  })
  @Index()
  action: LogAction;

  @Column({ length: 500 })
  message: string;

  @Column('text', { nullable: true })
  details?: string;

  // Notification context
  @Column({
    type: 'enum',
    enum: NotificationType,
    nullable: true,
  })
  notificationType?: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    nullable: true,
  })
  notificationStatus?: NotificationStatus;

  // Provider information
  @Column({ name: 'provider', nullable: true })
  provider?: string;

  @Column({ name: 'provider_message_id', nullable: true })
  providerMessageId?: string;

  @Column('jsonb', { name: 'provider_response', default: '{}' })
  providerResponse: Record<string, any>;

  // Error information
  @Column({ name: 'error_code', nullable: true })
  errorCode?: string;

  @Column({ name: 'error_message', nullable: true })
  errorMessage?: string;

  @Column('jsonb', { name: 'error_details', default: '{}' })
  errorDetails: Record<string, any>;

  // Performance metrics
  @Column({ name: 'processing_time_ms', nullable: true })
  processingTimeMs?: number;

  @Column({ name: 'queue_time_ms', nullable: true })
  queueTimeMs?: number;

  @Column({ name: 'delivery_time_ms', nullable: true })
  deliveryTimeMs?: number;

  // Request/Response data
  @Column('jsonb', { name: 'request_data', default: '{}' })
  requestData: Record<string, any>;

  @Column('jsonb', { name: 'response_data', default: '{}' })
  responseData: Record<string, any>;

  // Tracking information
  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;

  @Column({ name: 'device_type', nullable: true })
  deviceType?: string;

  @Column({ name: 'platform', nullable: true })
  platform?: string;

  // Geolocation
  @Column({ name: 'country', nullable: true })
  country?: string;

  @Column({ name: 'city', nullable: true })
  city?: string;

  @Column({ name: 'timezone', nullable: true })
  timezone?: string;

  // Campaign and tracking
  @Column({ name: 'campaign_id', nullable: true })
  campaignId?: string;

  @Column({ name: 'tracking_id', nullable: true })
  trackingId?: string;

  @Column('text', { array: true, default: '{}' })
  tags: string[];

  // Additional metadata
  @Column('jsonb', { name: 'metadata', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;

  // Static factory methods
  static createInfo(
    notificationId: string,
    action: LogAction,
    message: string,
    details?: any,
  ): Partial<NotificationLog> {
    return {
      notificationId,
      level: LogLevel.INFO,
      action,
      message,
      details: details ? JSON.stringify(details) : undefined,
    };
  }

  static createError(
    notificationId: string,
    action: LogAction,
    message: string,
    error?: Error | any,
    errorCode?: string,
  ): Partial<NotificationLog> {
    return {
      notificationId,
      level: LogLevel.ERROR,
      action,
      message,
      errorMessage: error?.message || error?.toString(),
      errorCode,
      errorDetails: error
        ? {
            name: error.name,
            stack: error.stack,
            ...error,
          }
        : {},
    };
  }

  static createDebug(
    notificationId: string,
    action: LogAction,
    message: string,
    debugData?: any,
  ): Partial<NotificationLog> {
    return {
      notificationId,
      level: LogLevel.DEBUG,
      action,
      message,
      metadata: debugData || {},
    };
  }

  static createDeliveryLog(
    notificationId: string,
    action: LogAction,
    provider: string,
    providerMessageId?: string,
    providerResponse?: any,
    processingTime?: number,
  ): Partial<NotificationLog> {
    return {
      notificationId,
      level: LogLevel.INFO,
      action,
      message: `Notification ${action} via ${provider}`,
      provider,
      providerMessageId,
      providerResponse: providerResponse || {},
      processingTimeMs: processingTime,
    };
  }

  static createInteractionLog(
    notificationId: string,
    action: LogAction,
    ipAddress?: string,
    userAgent?: string,
    metadata?: any,
  ): Partial<NotificationLog> {
    return {
      notificationId,
      level: LogLevel.INFO,
      action,
      message: `Notification ${action}`,
      ipAddress,
      userAgent,
      metadata: metadata || {},
    };
  }

  // Instance methods
  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  setProvider(provider: string, messageId?: string, response?: any): void {
    this.provider = provider;
    this.providerMessageId = messageId;
    this.providerResponse = response || {};
  }

  setError(error: Error | any, code?: string): void {
    this.level = LogLevel.ERROR;
    this.errorMessage = error?.message || error?.toString();
    this.errorCode = code;
    this.errorDetails = error
      ? {
          name: error.name,
          stack: error.stack,
          ...error,
        }
      : {};
  }

  setPerformanceMetrics(processingTime?: number, queueTime?: number, deliveryTime?: number): void {
    if (processingTime !== undefined) this.processingTimeMs = processingTime;
    if (queueTime !== undefined) this.queueTimeMs = queueTime;
    if (deliveryTime !== undefined) this.deliveryTimeMs = deliveryTime;
  }

  setRequestResponse(requestData?: any, responseData?: any): void {
    if (requestData) this.requestData = requestData;
    if (responseData) this.responseData = responseData;
  }

  setTrackingInfo(
    ipAddress?: string,
    userAgent?: string,
    deviceType?: string,
    platform?: string,
  ): void {
    if (ipAddress) this.ipAddress = ipAddress;
    if (userAgent) this.userAgent = userAgent;
    if (deviceType) this.deviceType = deviceType;
    if (platform) this.platform = platform;
  }

  setGeolocation(country?: string, city?: string, timezone?: string): void {
    if (country) this.country = country;
    if (city) this.city = city;
    if (timezone) this.timezone = timezone;
  }

  setCampaignInfo(campaignId?: string, trackingId?: string): void {
    if (campaignId) this.campaignId = campaignId;
    if (trackingId) this.trackingId = trackingId;
  }

  updateMetadata(key: string, value: any): void {
    this.metadata[key] = value;
  }

  // Virtual getters
  get isError(): boolean {
    return this.level === LogLevel.ERROR;
  }

  get isSuccess(): boolean {
    return [LogAction.SENT, LogAction.DELIVERED, LogAction.OPENED, LogAction.CLICKED].includes(
      this.action,
    );
  }

  get isFailure(): boolean {
    return [LogAction.FAILED, LogAction.BOUNCED, LogAction.COMPLAINED].includes(this.action);
  }

  get isInteraction(): boolean {
    return [LogAction.OPENED, LogAction.CLICKED].includes(this.action);
  }

  get hasProviderInfo(): boolean {
    return !!this.provider && !!this.providerMessageId;
  }

  get totalProcessingTime(): number {
    return (this.processingTimeMs || 0) + (this.queueTimeMs || 0) + (this.deliveryTimeMs || 0);
  }

  // Formatting methods
  getFormattedMessage(): string {
    const timestamp = this.createdAt.toISOString();
    const level = this.level.toUpperCase();
    const action = this.action.toUpperCase();

    let message = `[${timestamp}] ${level} - ${action}: ${this.message}`;

    if (this.provider) {
      message += ` (Provider: ${this.provider})`;
    }

    if (this.errorMessage) {
      message += ` - Error: ${this.errorMessage}`;
    }

    return message;
  }

  getFormattedDetails(): string {
    const details: string[] = [];

    if (this.details) {
      details.push(`Details: ${this.details}`);
    }

    if (this.processingTimeMs) {
      details.push(`Processing Time: ${this.processingTimeMs}ms`);
    }

    if (this.provider && this.providerMessageId) {
      details.push(`Provider: ${this.provider} (ID: ${this.providerMessageId})`);
    }

    if (this.ipAddress) {
      details.push(`IP: ${this.ipAddress}`);
    }

    if (this.userAgent) {
      details.push(`User Agent: ${this.userAgent}`);
    }

    return details.join(' | ');
  }

  toSummary() {
    return {
      id: this.id,
      notificationId: this.notificationId,
      level: this.level,
      action: this.action,
      message: this.message,
      provider: this.provider,
      providerMessageId: this.providerMessageId,
      errorCode: this.errorCode,
      errorMessage: this.errorMessage,
      processingTimeMs: this.processingTimeMs,
      isError: this.isError,
      isSuccess: this.isSuccess,
      isInteraction: this.isInteraction,
      createdAt: this.createdAt,
    };
  }

  toDetailedLog() {
    return {
      ...this.toSummary(),
      details: this.details,
      notificationType: this.notificationType,
      notificationStatus: this.notificationStatus,
      providerResponse: this.providerResponse,
      errorDetails: this.errorDetails,
      queueTimeMs: this.queueTimeMs,
      deliveryTimeMs: this.deliveryTimeMs,
      requestData: this.requestData,
      responseData: this.responseData,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      deviceType: this.deviceType,
      platform: this.platform,
      country: this.country,
      city: this.city,
      timezone: this.timezone,
      campaignId: this.campaignId,
      trackingId: this.trackingId,
      tags: this.tags,
      metadata: this.metadata,
    };
  }
}
