import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  Index,
  Unique
} from 'typeorm';
import { NotificationType, NotificationCategory } from './Notification';

@Entity('notification_preferences')
@Index(['user_id'])
@Unique(['user_id', 'type', 'category'])
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: NotificationType
  })
  @Index()
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationCategory
  })
  @Index()
  category: NotificationCategory;

  @Column({ name: 'is_enabled', default: true })
  isEnabled: boolean;

  // Delivery preferences
  @Column({ name: 'delivery_method', nullable: true })
  deliveryMethod?: 'immediate' | 'batched' | 'scheduled';

  @Column({ name: 'batch_frequency', nullable: true })
  batchFrequency?: 'hourly' | 'daily' | 'weekly';

  @Column({ name: 'scheduled_time', nullable: true })
  scheduledTime?: string; // HH:MM format

  @Column({ name: 'timezone', nullable: true })
  timezone?: string;

  // Quiet hours
  @Column({ name: 'quiet_hours_enabled', default: false })
  quietHoursEnabled: boolean;

  @Column({ name: 'quiet_hours_start', nullable: true })
  quietHoursStart?: string; // HH:MM format

  @Column({ name: 'quiet_hours_end', nullable: true })
  quietHoursEnd?: string; // HH:MM format

  @Column('text', { array: true, default: '{}' })
  quietDays: string[]; // Days of week: monday, tuesday, etc.

  // Email specific preferences
  @Column({ name: 'email_format', nullable: true })
  emailFormat?: 'html' | 'text' | 'both';

  @Column({ name: 'email_frequency', nullable: true })
  emailFrequency?: 'immediate' | 'digest_hourly' | 'digest_daily' | 'digest_weekly';

  @Column({ name: 'email_unsubscribed', default: false })
  emailUnsubscribed: boolean;

  @Column({ name: 'email_unsubscribed_at', nullable: true })
  emailUnsubscribedAt?: Date;

  // Push notification specific preferences
  @Column({ name: 'push_sound_enabled', default: true })
  pushSoundEnabled: boolean;

  @Column({ name: 'push_vibration_enabled', default: true })
  pushVibrationEnabled: boolean;

  @Column({ name: 'push_badge_enabled', default: true })
  pushBadgeEnabled: boolean;

  @Column({ name: 'push_preview_enabled', default: true })
  pushPreviewEnabled: boolean; // Show content in notification preview

  // SMS specific preferences
  @Column({ name: 'sms_enabled', default: false })
  smsEnabled: boolean;

  @Column({ name: 'sms_phone_number', nullable: true })
  smsPhoneNumber?: string;

  @Column({ name: 'sms_verified', default: false })
  smsVerified: boolean;

  @Column({ name: 'sms_verification_code', nullable: true })
  smsVerificationCode?: string;

  @Column({ name: 'sms_verification_expires_at', nullable: true })
  smsVerificationExpiresAt?: Date;

  // In-app notification preferences
  @Column({ name: 'in_app_enabled', default: true })
  inAppEnabled: boolean;

  @Column({ name: 'in_app_sound_enabled', default: true })
  inAppSoundEnabled: boolean;

  @Column({ name: 'in_app_auto_dismiss', default: false })
  inAppAutoDismiss: boolean;

  @Column({ name: 'in_app_dismiss_timeout', default: 5000 })
  inAppDismissTimeout: number; // milliseconds

  // Priority filtering
  @Column('text', { array: true, default: '["normal","high","urgent"]' })
  allowedPriorities: string[]; // Which priority levels to receive

  @Column({ name: 'min_priority_override', nullable: true })
  minPriorityOverride?: 'low' | 'normal' | 'high' | 'urgent';

  // Content filtering
  @Column('text', { array: true, default: '{}' })
  blockedKeywords: string[];

  @Column('text', { array: true, default: '{}' })
  allowedSenders: string[]; // User IDs or email addresses

  @Column('text', { array: true, default: '{}' })
  blockedSenders: string[]; // User IDs or email addresses

  // Language and localization
  @Column({ name: 'preferred_language', default: 'en' })
  preferredLanguage: string;

  @Column({ name: 'fallback_language', default: 'en' })
  fallbackLanguage: string;

  // Advanced settings
  @Column('jsonb', { name: 'custom_settings', default: '{}' })
  customSettings: Record<string, any>;

  @Column({ name: 'last_updated_by', nullable: true })
  lastUpdatedBy?: string; // User ID who made the last update

  @Column('jsonb', { name: 'metadata', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual getters
  get isInQuietHours(): boolean {
    if (!this.quietHoursEnabled || !this.quietHoursStart || !this.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });

    // Check if today is a quiet day
    if (this.quietDays.includes(currentDay)) {
      return true;
    }

    // Check if current time is within quiet hours
    if (this.quietHoursStart <= this.quietHoursEnd) {
      // Same day range (e.g., 09:00 to 17:00)
      return currentTime >= this.quietHoursStart && currentTime <= this.quietHoursEnd;
    } else {
      // Overnight range (e.g., 22:00 to 06:00)
      return currentTime >= this.quietHoursStart || currentTime <= this.quietHoursEnd;
    }
  }

  get shouldReceiveNotifications(): boolean {
    return this.isEnabled && !this.isInQuietHours;
  }

  get isEmailEnabled(): boolean {
    return this.type === NotificationType.EMAIL && this.isEnabled && !this.emailUnsubscribed;
  }

  get isPushEnabled(): boolean {
    return this.type === NotificationType.PUSH && this.isEnabled;
  }

  get isSmsEnabledAndVerified(): boolean {
    return this.type === NotificationType.SMS && this.smsEnabled && this.smsVerified;
  }

  // Methods
  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }

  unsubscribeEmail(): void {
    if (this.type === NotificationType.EMAIL) {
      this.emailUnsubscribed = true;
      this.emailUnsubscribedAt = new Date();
    }
  }

  resubscribeEmail(): void {
    if (this.type === NotificationType.EMAIL) {
      this.emailUnsubscribed = false;
      this.emailUnsubscribedAt = null;
    }
  }

  setQuietHours(start: string, end: string, days: string[] = []): void {
    this.quietHoursEnabled = true;
    this.quietHoursStart = start;
    this.quietHoursEnd = end;
    this.quietDays = days;
  }

  disableQuietHours(): void {
    this.quietHoursEnabled = false;
    this.quietHoursStart = null;
    this.quietHoursEnd = null;
    this.quietDays = [];
  }

  setSmsPhoneNumber(phoneNumber: string): void {
    this.smsPhoneNumber = phoneNumber;
    this.smsVerified = false;
    this.smsVerificationCode = this.generateVerificationCode();
    this.smsVerificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  }

  verifySms(code: string): boolean {
    if (!this.smsVerificationCode || !this.smsVerificationExpiresAt) {
      return false;
    }

    if (new Date() > this.smsVerificationExpiresAt) {
      return false;
    }

    if (this.smsVerificationCode === code) {
      this.smsVerified = true;
      this.smsVerificationCode = null;
      this.smsVerificationExpiresAt = null;
      return true;
    }

    return false;
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  addBlockedKeyword(keyword: string): void {
    if (!this.blockedKeywords.includes(keyword.toLowerCase())) {
      this.blockedKeywords.push(keyword.toLowerCase());
    }
  }

  removeBlockedKeyword(keyword: string): void {
    this.blockedKeywords = this.blockedKeywords.filter(k => k !== keyword.toLowerCase());
  }

  addAllowedSender(sender: string): void {
    if (!this.allowedSenders.includes(sender)) {
      this.allowedSenders.push(sender);
    }
  }

  removeAllowedSender(sender: string): void {
    this.allowedSenders = this.allowedSenders.filter(s => s !== sender);
  }

  addBlockedSender(sender: string): void {
    if (!this.blockedSenders.includes(sender)) {
      this.blockedSenders.push(sender);
    }
  }

  removeBlockedSender(sender: string): void {
    this.blockedSenders = this.blockedSenders.filter(s => s !== sender);
  }

  shouldReceiveFromSender(senderId: string): boolean {
    // Check blocked senders first
    if (this.blockedSenders.includes(senderId)) {
      return false;
    }

    // If there are allowed senders, check if sender is in the list
    if (this.allowedSenders.length > 0) {
      return this.allowedSenders.includes(senderId);
    }

    return true;
  }

  shouldReceiveWithPriority(priority: string): boolean {
    // Check minimum priority override
    if (this.minPriorityOverride) {
      const priorityLevels = ['low', 'normal', 'high', 'urgent'];
      const minIndex = priorityLevels.indexOf(this.minPriorityOverride);
      const currentIndex = priorityLevels.indexOf(priority);
      return currentIndex >= minIndex;
    }

    // Check allowed priorities
    return this.allowedPriorities.includes(priority);
  }

  shouldReceiveContent(content: string): boolean {
    if (this.blockedKeywords.length === 0) {
      return true;
    }

    const contentLower = content.toLowerCase();
    return !this.blockedKeywords.some(keyword => contentLower.includes(keyword));
  }

  canReceiveNotification(notification: {
    senderId?: string;
    priority: string;
    content: string;
  }): boolean {
    if (!this.shouldReceiveNotifications) {
      return false;
    }

    if (notification.senderId && !this.shouldReceiveFromSender(notification.senderId)) {
      return false;
    }

    if (!this.shouldReceiveWithPriority(notification.priority)) {
      return false;
    }

    if (!this.shouldReceiveContent(notification.content)) {
      return false;
    }

    return true;
  }

  updateCustomSetting(key: string, value: any): void {
    this.customSettings[key] = value;
  }

  removeCustomSetting(key: string): void {
    delete this.customSettings[key];
  }

  getCustomSetting(key: string, defaultValue?: any): any {
    return this.customSettings[key] ?? defaultValue;
  }

  toSummary() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      category: this.category,
      isEnabled: this.isEnabled,
      deliveryMethod: this.deliveryMethod,
      batchFrequency: this.batchFrequency,
      quietHoursEnabled: this.quietHoursEnabled,
      emailUnsubscribed: this.emailUnsubscribed,
      smsEnabled: this.smsEnabled,
      smsVerified: this.smsVerified,
      inAppEnabled: this.inAppEnabled,
      preferredLanguage: this.preferredLanguage,
      allowedPriorities: this.allowedPriorities,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}