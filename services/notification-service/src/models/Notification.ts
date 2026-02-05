import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

export enum NotificationType {
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  IN_APP = 'in_app',
  SLACK = 'slack',
  DISCORD = 'discord',
  WEBHOOK = 'webhook'
}

export enum NotificationStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  CLICKED = 'clicked',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationCategory {
  SYSTEM = 'system',
  MARKETING = 'marketing',
  TRANSACTIONAL = 'transactional',
  SECURITY = 'security',
  SOCIAL = 'social',
  REMINDER = 'reminder',
  ALERT = 'alert'
}

@Entity('notifications')
@Index(['type', 'status'])
@Index(['category', 'priority'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'recipient_id' })
  @Index()
  recipientId: string; // User ID

  @Column({ name: 'recipient_email', nullable: true })
  recipientEmail?: string;

  @Column({ name: 'recipient_phone', nullable: true })
  recipientPhone?: string;

  @Column({
    type: 'enum',
    enum: NotificationType
  })
  @Index()
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING
  })
  @Index()
  status: NotificationStatus;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.NORMAL
  })
  @Index()
  priority: NotificationPriority;

  @Column({
    type: 'enum',
    enum: NotificationCategory,
    default: NotificationCategory.SYSTEM
  })
  @Index()
  category: NotificationCategory;

  @Column({ length: 500 })
  title: string;

  @Column('text')
  content: string;

  @Column('text', { nullable: true })
  summary?: string; // Short version for push notifications

  @Column({ name: 'template_id', nullable: true })
  templateId?: string;

  @Column('jsonb', { name: 'template_data', default: '{}' })
  templateData: Record<string, any>;

  // Delivery configuration
  @Column({ name: 'scheduled_at', nullable: true })
  @Index()
  scheduledAt?: Date;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'max_retries', default: 3 })
  maxRetries: number;

  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  @Column({ name: 'retry_delay', default: 300000 }) // 5 minutes
  retryDelay: number;

  // Email specific fields
  @Column({ name: 'email_subject', nullable: true })
  emailSubject?: string;

  @Column({ name: 'email_from', nullable: true })
  emailFrom?: string;

  @Column({ name: 'email_reply_to', nullable: true })
  emailReplyTo?: string;

  @Column('text', { array: true, default: '{}' })
  emailCc: string[];

  @Column('text', { array: true, default: '{}' })
  emailBcc: string[];

  @Column('text', { array: true, default: '{}' })
  attachments: string[]; // URLs to attachments

  // Push notification specific fields
  @Column({ name: 'push_icon', nullable: true })
  pushIcon?: string;

  @Column({ name: 'push_image', nullable: true })
  pushImage?: string;

  @Column({ name: 'push_badge', nullable: true })
  pushBadge?: string;

  @Column({ name: 'push_sound', nullable: true })
  pushSound?: string;

  @Column({ name: 'push_click_action', nullable: true })
  pushClickAction?: string;

  @Column('jsonb', { name: 'push_data', default: '{}' })
  pushData: Record<string, any>;

  // SMS specific fields
  @Column({ name: 'sms_from', nullable: true })
  smsFrom?: string;

  // Webhook specific fields
  @Column({ name: 'webhook_url', nullable: true })
  webhookUrl?: string;

  @Column({ name: 'webhook_method', default: 'POST' })
  webhookMethod: string;

  @Column('jsonb', { name: 'webhook_headers', default: '{}' })
  webhookHeaders: Record<string, string>;

  @Column('jsonb', { name: 'webhook_payload', default: '{}' })
  webhookPayload: Record<string, any>;

  // Tracking and analytics
  @Column({ name: 'tracking_id', nullable: true })
  trackingId?: string;

  @Column({ name: 'campaign_id', nullable: true })
  campaignId?: string;

  @Column('text', { array: true, default: '{}' })
  tags: string[];

  @Column('jsonb', { name: 'analytics_data', default: '{}' })
  analyticsData: {
    sentAt?: Date;
    deliveredAt?: Date;
    openedAt?: Date;
    clickedAt?: Date;
    bounced?: boolean;
    unsubscribed?: boolean;
    complained?: boolean;
  };

  // Delivery tracking
  @Column({ name: 'sent_at', nullable: true })
  sentAt?: Date;

  @Column({ name: 'delivered_at', nullable: true })
  deliveredAt?: Date;

  @Column({ name: 'opened_at', nullable: true })
  openedAt?: Date;

  @Column({ name: 'clicked_at', nullable: true })
  clickedAt?: Date;

  @Column({ name: 'failed_at', nullable: true })
  failedAt?: Date;

  @Column({ name: 'cancelled_at', nullable: true })
  cancelledAt?: Date;

  // Error handling
  @Column({ name: 'error_message', nullable: true })
  errorMessage?: string;

  @Column({ name: 'error_code', nullable: true })
  errorCode?: string;

  @Column('jsonb', { name: 'error_details', default: '{}' })
  errorDetails: Record<string, any>;

  // Provider information
  @Column({ name: 'provider', nullable: true })
  provider?: string; // sendgrid, mailgun, twilio, etc.

  @Column({ name: 'provider_message_id', nullable: true })
  providerMessageId?: string;

  @Column('jsonb', { name: 'provider_response', default: '{}' })
  providerResponse: Record<string, any>;

  // Additional metadata
  @Column('jsonb', { name: 'metadata', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual getters
  get isScheduled(): boolean {
    return !!this.scheduledAt && this.scheduledAt > new Date();
  }

  get isExpired(): boolean {
    return !!this.expiresAt && this.expiresAt < new Date();
  }

  get canRetry(): boolean {
    return this.retryCount < this.maxRetries &&
      this.status === NotificationStatus.FAILED &&
      !this.isExpired;
  }

  get deliveryTime(): number | null {
    if (!this.sentAt || !this.deliveredAt) return null;
    return this.deliveredAt.getTime() - this.sentAt.getTime();
  }

  get isDelivered(): boolean {
    return [
      NotificationStatus.DELIVERED,
      NotificationStatus.OPENED,
      NotificationStatus.CLICKED
    ].includes(this.status);
  }

  get isInteracted(): boolean {
    return [
      NotificationStatus.OPENED,
      NotificationStatus.CLICKED
    ].includes(this.status);
  }

  // Methods
  markAsSent(providerMessageId?: string, providerResponse?: any): void {
    this.status = NotificationStatus.SENT;
    this.sentAt = new Date();
    this.analyticsData.sentAt = this.sentAt;

    if (providerMessageId) {
      this.providerMessageId = providerMessageId;
    }

    if (providerResponse) {
      this.providerResponse = providerResponse;
    }
  }

  markAsDelivered(): void {
    this.status = NotificationStatus.DELIVERED;
    this.deliveredAt = new Date();
    this.analyticsData.deliveredAt = this.deliveredAt;
  }

  markAsOpened(): void {
    this.status = NotificationStatus.OPENED;
    this.openedAt = new Date();
    this.analyticsData.openedAt = this.openedAt;
  }

  markAsClicked(): void {
    this.status = NotificationStatus.CLICKED;
    this.clickedAt = new Date();
    this.analyticsData.clickedAt = this.clickedAt;
  }

  markAsFailed(errorMessage: string, errorCode?: string, errorDetails?: any): void {
    this.status = NotificationStatus.FAILED;
    this.failedAt = new Date();
    this.errorMessage = errorMessage;
    this.errorCode = errorCode;
    this.errorDetails = errorDetails || {};
    this.retryCount += 1;
  }

  markAsCancelled(reason?: string): void {
    this.status = NotificationStatus.CANCELLED;
    this.cancelledAt = new Date();
    if (reason) {
      this.metadata.cancellationReason = reason;
    }
  }

  schedule(scheduledAt: Date): void {
    this.scheduledAt = scheduledAt;
    this.status = NotificationStatus.QUEUED;
  }

  setExpiration(expiresAt: Date): void {
    this.expiresAt = expiresAt;
  }

  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
  }

  addAttachment(url: string): void {
    if (!this.attachments.includes(url)) {
      this.attachments.push(url);
    }
  }

  setTrackingId(trackingId: string): void {
    this.trackingId = trackingId;
  }

  setCampaignId(campaignId: string): void {
    this.campaignId = campaignId;
  }

  updateAnalytics(data: Partial<Notification['analyticsData']>): void {
    this.analyticsData = { ...this.analyticsData, ...data };
  }

  getNextRetryAt(): Date | null {
    if (!this.canRetry) return null;

    // Exponential backoff: delay * (2 ^ retryCount)
    const delay = this.retryDelay * Math.pow(2, this.retryCount);
    return new Date(Date.now() + delay);
  }

  shouldSendNow(): boolean {
    if (this.isExpired) return false;
    if (this.status !== NotificationStatus.PENDING && this.status !== NotificationStatus.QUEUED) return false;
    if (this.scheduledAt && this.scheduledAt > new Date()) return false;
    return true;
  }

  getDisplayTitle(): string {
    return this.title || this.emailSubject || 'Notification';
  }

  getDisplayContent(): string {
    return this.summary || this.content.substring(0, 100) + (this.content.length > 100 ? '...' : '');
  }

  toSummary() {
    return {
      id: this.id,
      recipientId: this.recipientId,
      type: this.type,
      status: this.status,
      priority: this.priority,
      category: this.category,
      title: this.getDisplayTitle(),
      content: this.getDisplayContent(),
      scheduledAt: this.scheduledAt,
      sentAt: this.sentAt,
      deliveredAt: this.deliveredAt,
      isDelivered: this.isDelivered,
      isInteracted: this.isInteracted,
      createdAt: this.createdAt,
    };
  }
}