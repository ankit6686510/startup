import { Repository } from 'typeorm';
import { AppDataSource } from '@/config/database';
import {
  Notification,
  NotificationType,
  NotificationStatus,
  NotificationPriority,
  NotificationCategory,
} from '@/models/Notification';
import { NotificationTemplate } from '@/models/NotificationTemplate';
import { NotificationPreference } from '@/models/NotificationPreference';
import { NotificationLog, LogAction, LogLevel } from '@/models/NotificationLog';
import { EmailProvider } from '@/providers/EmailProvider';
import { PushProvider } from '@/providers/PushProvider';
import { SmsProvider } from '@/providers/SmsProvider';
import { TemplateEngine } from '@/utils/TemplateEngine';
import { NotificationQueue } from '@/queues/NotificationQueue';
import { logger } from '@/utils/logger';

export interface NotificationCreateData {
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  type: NotificationType;
  priority?: NotificationPriority;
  category?: NotificationCategory;
  title: string;
  content: string;
  summary?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  scheduledAt?: Date;
  expiresAt?: Date;
  emailSubject?: string;
  emailFrom?: string;
  emailReplyTo?: string;
  emailCc?: string[];
  emailBcc?: string[];
  attachments?: string[];
  pushIcon?: string;
  pushImage?: string;
  pushSound?: string;
  pushClickAction?: string;
  pushData?: Record<string, any>;
  smsFrom?: string;
  webhookUrl?: string;
  webhookMethod?: string;
  webhookHeaders?: Record<string, string>;
  webhookPayload?: Record<string, any>;
  trackingId?: string;
  campaignId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface NotificationFilters {
  recipientIds?: string[];
  types?: NotificationType[];
  statuses?: NotificationStatus[];
  priorities?: NotificationPriority[];
  categories?: NotificationCategory[];
  dateFrom?: Date;
  dateTo?: Date;
  campaignId?: string;
  tags?: string[];
}

export class NotificationService {
  private notificationRepository: Repository<Notification>;
  private templateRepository: Repository<NotificationTemplate>;
  private preferenceRepository: Repository<NotificationPreference>;
  private logRepository: Repository<NotificationLog>;
  private emailProvider: EmailProvider;
  private pushProvider: PushProvider;
  private smsProvider: SmsProvider;
  private templateEngine: TemplateEngine;
  private notificationQueue: NotificationQueue;

  constructor() {
    this.notificationRepository = AppDataSource.getRepository(Notification);
    this.templateRepository = AppDataSource.getRepository(NotificationTemplate);
    this.preferenceRepository = AppDataSource.getRepository(NotificationPreference);
    this.logRepository = AppDataSource.getRepository(NotificationLog);
    this.emailProvider = new EmailProvider();
    this.pushProvider = new PushProvider();
    this.smsProvider = new SmsProvider();
    this.templateEngine = new TemplateEngine();
    this.notificationQueue = new NotificationQueue();
  }

  async createNotification(data: NotificationCreateData): Promise<Notification> {
    // Check user preferences
    const preferences = await this.getUserPreferences(data.recipientId, data.type, data.category);

    if (
      !preferences?.canReceiveNotification({
        senderId: undefined,
        priority: data.priority || NotificationPriority.NORMAL,
        content: data.content,
      })
    ) {
      throw new Error('User has disabled notifications for this type/category');
    }

    // Process template if provided
    let processedContent = data;
    if (data.templateId) {
      processedContent = await this.processTemplate(data);
    }

    // Create notification
    const notification = this.notificationRepository.create({
      ...processedContent,
      status: NotificationStatus.PENDING,
      priority: data.priority || NotificationPriority.NORMAL,
      category: data.category || NotificationCategory.SYSTEM,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    // Log creation
    await this.createLog(savedNotification.id, LogAction.CREATED, 'Notification created', {
      notificationType: savedNotification.type,
    });

    // Queue for delivery
    if (savedNotification.shouldSendNow()) {
      await this.queueNotification(savedNotification);
    }

    logger.info(
      `Notification created: ${savedNotification.id} for user ${savedNotification.recipientId}`,
    );
    return savedNotification;
  }

  async sendNotification(notificationId: string): Promise<boolean> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (!notification.shouldSendNow()) {
      logger.warn(`Notification ${notificationId} is not ready to send`);
      return false;
    }

    try {
      notification.status = NotificationStatus.SENDING;
      await this.notificationRepository.save(notification);

      let success = false;
      const startTime = Date.now();

      switch (notification.type) {
        case NotificationType.EMAIL:
          success = await this.sendEmail(notification);
          break;
        case NotificationType.PUSH:
          success = await this.sendPush(notification);
          break;
        case NotificationType.SMS:
          success = await this.sendSms(notification);
          break;
        case NotificationType.IN_APP:
          success = await this.sendInApp(notification);
          break;
        case NotificationType.SLACK:
          success = await this.sendSlack(notification);
          break;
        case NotificationType.DISCORD:
          success = await this.sendDiscord(notification);
          break;
        case NotificationType.WEBHOOK:
          success = await this.sendWebhook(notification);
          break;
        default:
          throw new Error(`Unsupported notification type: ${notification.type}`);
      }

      const processingTime = Date.now() - startTime;

      if (success) {
        notification.markAsSent();
        await this.createLog(
          notification.id,
          LogAction.SENT,
          `Notification sent via ${notification.type}`,
          { processingTimeMs: processingTime },
        );
      } else {
        notification.markAsFailed('Failed to send notification');
        await this.createLog(
          notification.id,
          LogAction.FAILED,
          `Failed to send notification via ${notification.type}`,
          { processingTimeMs: processingTime },
        );
      }

      await this.notificationRepository.save(notification);
      return success;
    } catch (error) {
      notification.markAsFailed(
        error instanceof Error ? error.message : 'Unknown error',
        'SEND_ERROR',
        error,
      );
      await this.notificationRepository.save(notification);

      await this.createLog(
        notification.id,
        LogAction.FAILED,
        `Error sending notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { error },
      );

      logger.error(`Error sending notification ${notificationId}:`, error);
      return false;
    }
  }

  async retryNotification(notificationId: string): Promise<boolean> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (!notification.canRetry) {
      throw new Error('Notification cannot be retried');
    }

    await this.createLog(
      notification.id,
      LogAction.RETRIED,
      `Retrying notification (attempt ${notification.retryCount + 1})`,
    );

    return await this.sendNotification(notificationId);
  }

  async cancelNotification(notificationId: string, reason?: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.markAsCancelled(reason);
    await this.notificationRepository.save(notification);

    await this.createLog(
      notification.id,
      LogAction.CANCELLED,
      `Notification cancelled: ${reason || 'No reason provided'}`,
    );

    logger.info(`Notification cancelled: ${notificationId}`);
  }

  async getNotifications(
    filters: NotificationFilters,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ notifications: Notification[]; total: number }> {
    const queryBuilder = this.notificationRepository.createQueryBuilder('notification');

    if (filters.recipientIds && filters.recipientIds.length > 0) {
      queryBuilder.andWhere('notification.recipientId IN (:...recipientIds)', {
        recipientIds: filters.recipientIds,
      });
    }

    if (filters.types && filters.types.length > 0) {
      queryBuilder.andWhere('notification.type IN (:...types)', { types: filters.types });
    }

    if (filters.statuses && filters.statuses.length > 0) {
      queryBuilder.andWhere('notification.status IN (:...statuses)', {
        statuses: filters.statuses,
      });
    }

    if (filters.priorities && filters.priorities.length > 0) {
      queryBuilder.andWhere('notification.priority IN (:...priorities)', {
        priorities: filters.priorities,
      });
    }

    if (filters.categories && filters.categories.length > 0) {
      queryBuilder.andWhere('notification.category IN (:...categories)', {
        categories: filters.categories,
      });
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere('notification.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere('notification.createdAt <= :dateTo', { dateTo: filters.dateTo });
    }

    if (filters.campaignId) {
      queryBuilder.andWhere('notification.campaignId = :campaignId', {
        campaignId: filters.campaignId,
      });
    }

    if (filters.tags && filters.tags.length > 0) {
      queryBuilder.andWhere('notification.tags && :tags', { tags: filters.tags });
    }

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Default sorting by created date (newest first)
    queryBuilder.orderBy('notification.createdAt', 'DESC');

    const [notifications, total] = await queryBuilder.getManyAndCount();
    return { notifications, total };
  }

  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ notifications: Notification[]; total: number }> {
    return await this.getNotifications({ recipientIds: [userId] }, page, limit);
  }

  async getNotificationById(id: string): Promise<Notification | null> {
    return await this.notificationRepository.findOne({
      where: { id },
    });
  }

  async markAsDelivered(notificationId: string, providerData?: any): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.markAsDelivered();
    if (providerData) {
      notification.providerResponse = { ...notification.providerResponse, ...providerData };
    }

    await this.notificationRepository.save(notification);

    await this.createLog(notification.id, LogAction.DELIVERED, 'Notification delivered');
  }

  async markAsOpened(notificationId: string, trackingData?: any): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.markAsOpened();
    await this.notificationRepository.save(notification);

    await this.createLog(notification.id, LogAction.OPENED, 'Notification opened', trackingData);
  }

  async markAsClicked(notificationId: string, trackingData?: any): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.markAsClicked();
    await this.notificationRepository.save(notification);

    await this.createLog(notification.id, LogAction.CLICKED, 'Notification clicked', trackingData);
  }

  // Private helper methods
  private async processTemplate(data: NotificationCreateData): Promise<NotificationCreateData> {
    if (!data.templateId) return data;

    const template = await this.templateRepository.findOne({
      where: { id: data.templateId, isActive: true },
    });

    if (!template) {
      throw new Error('Template not found or inactive');
    }

    // Validate template variables
    const validation = template.validateVariables(data.templateData || {});
    if (!validation.isValid) {
      throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
    }

    // Process template content
    const processedContent = await this.templateEngine.render(template, data.templateData || {});

    // Increment template usage
    template.incrementUsage();
    await this.templateRepository.save(template);

    return {
      ...data,
      title: processedContent.subject || data.title,
      content: processedContent.content,
      summary: processedContent.summary || data.summary,
      emailSubject: processedContent.subject,
      // Apply template styling and settings
      emailFrom: template.emailFrom || data.emailFrom,
      emailReplyTo: template.emailReplyTo || data.emailReplyTo,
      pushIcon: template.pushIcon || data.pushIcon,
      pushSound: template.pushSound || data.pushSound,
      smsFrom: template.smsFrom || data.smsFrom,
    };
  }

  private async getUserPreferences(
    userId: string,
    type: NotificationType,
    category?: NotificationCategory,
  ): Promise<NotificationPreference | null> {
    return await this.preferenceRepository.findOne({
      where: {
        userId,
        type,
        category: category || NotificationCategory.SYSTEM,
      },
    });
  }

  private async queueNotification(notification: Notification): Promise<void> {
    await this.notificationQueue.add(
      'send-notification',
      {
        notificationId: notification.id,
      },
      {
        delay: notification.scheduledAt ? notification.scheduledAt.getTime() - Date.now() : 0,
        attempts: notification.maxRetries + 1,
        backoff: {
          type: 'exponential',
          delay: notification.retryDelay,
        },
      },
    );

    notification.status = NotificationStatus.QUEUED;
    await this.notificationRepository.save(notification);

    await this.createLog(notification.id, LogAction.QUEUED, 'Notification queued for delivery');
  }

  private async sendEmail(notification: Notification): Promise<boolean> {
    return await this.emailProvider.send({
      to: notification.recipientEmail || '',
      subject: notification.emailSubject || notification.title,
      html: notification.content,
      from: notification.emailFrom,
      replyTo: notification.emailReplyTo,
      cc: notification.emailCc,
      bcc: notification.emailBcc,
      attachments: notification.attachments,
      trackingId: notification.trackingId,
      metadata: notification.metadata,
    });
  }

  private async sendPush(notification: Notification): Promise<boolean> {
    return await this.pushProvider.send({
      userId: notification.recipientId,
      title: notification.title,
      body: notification.summary || notification.content,
      icon: notification.pushIcon,
      image: notification.pushImage,
      sound: notification.pushSound,
      clickAction: notification.pushClickAction,
      data: notification.pushData,
      trackingId: notification.trackingId,
    });
  }

  private async sendSms(notification: Notification): Promise<boolean> {
    return await this.smsProvider.send({
      to: notification.recipientPhone || '',
      message: notification.summary || notification.content,
      from: notification.smsFrom,
      trackingId: notification.trackingId,
    });
  }

  private async sendInApp(notification: Notification): Promise<boolean> {
    // In-app notifications are typically stored in database and retrieved by frontend
    // Mark as sent immediately since it's stored
    return true;
  }

  private async sendSlack(notification: Notification): Promise<boolean> {
    // TODO: Implement Slack integration
    return false;
  }

  private async sendDiscord(notification: Notification): Promise<boolean> {
    // TODO: Implement Discord integration
    return false;
  }

  private async sendWebhook(notification: Notification): Promise<boolean> {
    // TODO: Implement webhook delivery
    return false;
  }

  private async createLog(
    notificationId: string,
    action: LogAction,
    message: string,
    details?: any,
  ): Promise<void> {
    const log = this.logRepository.create({
      notificationId,
      level: LogLevel.INFO,
      action,
      message,
      details: details ? JSON.stringify(details) : undefined,
      metadata: details || {},
    });

    await this.logRepository.save(log);
  }

  async getNotificationStats(userId?: string): Promise<any> {
    const queryBuilder = this.notificationRepository.createQueryBuilder('notification');

    if (userId) {
      queryBuilder.where('notification.recipientId = :userId', { userId });
    }

    const [total, sent, delivered, opened, clicked, failed] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder
        .clone()
        .andWhere('notification.status = :status', { status: NotificationStatus.SENT })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('notification.status = :status', { status: NotificationStatus.DELIVERED })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('notification.status = :status', { status: NotificationStatus.OPENED })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('notification.status = :status', { status: NotificationStatus.CLICKED })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('notification.status = :status', { status: NotificationStatus.FAILED })
        .getCount(),
    ]);

    return {
      total,
      sent,
      delivered,
      opened,
      clicked,
      failed,
      deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
      openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
      clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
      failureRate: total > 0 ? (failed / total) * 100 : 0,
    };
  }
}
