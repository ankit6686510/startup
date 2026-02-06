import { WebSocketServer } from './websocket-server';
import { EventEmitter } from 'events';

export interface NotificationTemplate {
  id: string;
  type: string;
  title: string;
  message: string;
  icon?: string;
  action?: {
    label: string;
    url: string;
  };
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channels: ('in-app' | 'email' | 'push' | 'sms')[];
  expiresAt?: Date;
}

export interface NotificationRecipient {
  userId: string;
  email: string;
  preferences: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export interface NotificationContext {
  userId?: string;
  startupId?: string;
  jobId?: string;
  fundingId?: string;
  applicationId?: string;
  [key: string]: any;
}

export class RealTimeNotificationService extends EventEmitter {
  private wsServer: WebSocketServer;
  private templates: Map<string, NotificationTemplate> = new Map();
  private notificationHistory: Map<string, any[]> = new Map();

  constructor(wsServer: WebSocketServer) {
    super();
    this.wsServer = wsServer;
    this.setupDefaultTemplates();
  }

  private setupDefaultTemplates(): void {
    const templates: NotificationTemplate[] = [
      // Job-related notifications
      {
        id: 'job_application_received',
        type: 'job_application',
        title: 'New Job Application',
        message: 'You received a new application for {{jobTitle}}',
        icon: '📄',
        action: {
          label: 'View Application',
          url: '/jobs/{{jobId}}/applications/{{applicationId}}',
        },
        priority: 'normal',
        channels: ['in-app', 'email'],
      },
      {
        id: 'job_application_status_update',
        type: 'job_application',
        title: 'Application Status Update',
        message: 'Your application for {{jobTitle}} has been {{status}}',
        icon: '📋',
        action: {
          label: 'View Details',
          url: '/applications/{{applicationId}}',
        },
        priority: 'high',
        channels: ['in-app', 'email', 'push'],
      },
      {
        id: 'new_job_match',
        type: 'job_alert',
        title: 'New Job Match',
        message: 'Found a new job that matches your criteria: {{jobTitle}}',
        icon: '🎯',
        action: {
          label: 'View Job',
          url: '/jobs/{{jobId}}',
        },
        priority: 'normal',
        channels: ['in-app', 'push'],
      },

      // Startup-related notifications
      {
        id: 'startup_funding_announced',
        type: 'funding_update',
        title: 'Funding Announcement',
        message: '{{startupName}} raised {{amount}} in {{round}} funding',
        icon: '💰',
        action: {
          label: 'View Details',
          url: '/startups/{{startupId}}/funding',
        },
        priority: 'normal',
        channels: ['in-app'],
      },
      {
        id: 'startup_job_posted',
        type: 'startup_update',
        title: 'New Job Posted',
        message: '{{startupName}} posted a new job: {{jobTitle}}',
        icon: '🚀',
        action: {
          label: 'View Job',
          url: '/jobs/{{jobId}}',
        },
        priority: 'normal',
        channels: ['in-app'],
      },
      {
        id: 'startup_milestone',
        type: 'startup_update',
        title: 'Startup Milestone',
        message: '{{startupName}} achieved a new milestone: {{milestone}}',
        icon: '🎉',
        action: {
          label: 'View Startup',
          url: '/startups/{{startupId}}',
        },
        priority: 'normal',
        channels: ['in-app'],
      },

      // User-related notifications
      {
        id: 'profile_view',
        type: 'user_activity',
        title: 'Profile Viewed',
        message: '{{viewerName}} viewed your profile',
        icon: '👀',
        action: {
          label: 'View Profile',
          url: '/users/{{viewerId}}',
        },
        priority: 'low',
        channels: ['in-app'],
      },
      {
        id: 'connection_request',
        type: 'user_activity',
        title: 'Connection Request',
        message: '{{requesterName}} wants to connect with you',
        icon: '🤝',
        action: {
          label: 'View Request',
          url: '/connections/requests',
        },
        priority: 'normal',
        channels: ['in-app', 'email'],
      },
      {
        id: 'message_received',
        type: 'messaging',
        title: 'New Message',
        message: 'You have a new message from {{senderName}}',
        icon: '💬',
        action: {
          label: 'View Message',
          url: '/messages/{{conversationId}}',
        },
        priority: 'high',
        channels: ['in-app', 'push'],
      },

      // System notifications
      {
        id: 'account_security_alert',
        type: 'security',
        title: 'Security Alert',
        message: '{{alertMessage}}',
        icon: '🔒',
        action: {
          label: 'Review Security',
          url: '/settings/security',
        },
        priority: 'urgent',
        channels: ['in-app', 'email', 'sms'],
      },
      {
        id: 'system_maintenance',
        type: 'system',
        title: 'Scheduled Maintenance',
        message: 'System maintenance scheduled for {{maintenanceTime}}',
        icon: '🔧',
        priority: 'normal',
        channels: ['in-app'],
      },
    ];

    templates.forEach((template) => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Send a notification using a template
   */
  public async sendNotification(
    templateId: string,
    recipients: NotificationRecipient[],
    context: NotificationContext = {},
  ): Promise<void> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Notification template not found: ${templateId}`);
    }

    for (const recipient of recipients) {
      const notification = this.buildNotification(template, recipient, context);
      await this.deliverNotification(notification, recipient);
    }
  }

  /**
   * Send a custom notification without template
   */
  public async sendCustomNotification(
    notification: Partial<NotificationTemplate>,
    recipients: NotificationRecipient[],
    context: NotificationContext = {},
  ): Promise<void> {
    const fullNotification: NotificationTemplate = {
      id: `custom_${Date.now()}`,
      type: 'custom',
      title: notification.title || 'Notification',
      message: notification.message || '',
      priority: notification.priority || 'normal',
      channels: notification.channels || ['in-app'],
      ...notification,
    };

    for (const recipient of recipients) {
      const processedNotification = this.buildNotification(fullNotification, recipient, context);
      await this.deliverNotification(processedNotification, recipient);
    }
  }

  /**
   * Send job alert notifications
   */
  public async sendJobAlert(jobData: any, recipients: NotificationRecipient[]): Promise<void> {
    const context = {
      jobId: jobData.id,
      jobTitle: jobData.title,
      companyName: jobData.company,
      location: jobData.location,
      salary: jobData.salary,
    };

    await this.sendNotification('new_job_match', recipients, context);

    // Also send via WebSocket for real-time updates
    recipients.forEach((recipient) => {
      if (recipient.preferences.inApp) {
        this.wsServer.sendNotificationToUser(recipient.userId, {
          type: 'job_alert',
          job: jobData,
          timestamp: Date.now(),
        });
      }
    });
  }

  /**
   * Send startup update notifications
   */
  public async sendStartupUpdate(
    startupId: string,
    updateType: 'funding' | 'job' | 'milestone' | 'news',
    updateData: any,
    recipients: NotificationRecipient[],
  ): Promise<void> {
    let templateId: string;
    const context: NotificationContext = { startupId, ...updateData };

    switch (updateType) {
      case 'funding':
        templateId = 'startup_funding_announced';
        break;
      case 'job':
        templateId = 'startup_job_posted';
        break;
      case 'milestone':
        templateId = 'startup_milestone';
        break;
      default:
        templateId = 'startup_milestone'; // Generic update
    }

    await this.sendNotification(templateId, recipients, context);

    // Send real-time update via WebSocket
    this.wsServer.sendStartupUpdate(startupId, {
      type: updateType,
      data: updateData,
      timestamp: Date.now(),
    });
  }

  /**
   * Send funding update notifications
   */
  public async sendFundingUpdate(
    fundingData: any,
    recipients: NotificationRecipient[],
  ): Promise<void> {
    const context = {
      startupId: fundingData.startupId,
      startupName: fundingData.startupName,
      amount: this.formatCurrency(fundingData.amount, fundingData.currency),
      round: fundingData.round,
      leadInvestor: fundingData.leadInvestor,
    };

    await this.sendNotification('startup_funding_announced', recipients, context);

    // Send real-time update via WebSocket
    this.wsServer.sendFundingUpdate(
      {},
      {
        funding: fundingData,
        timestamp: Date.now(),
      },
    );
  }

  /**
   * Send application status update
   */
  public async sendApplicationStatusUpdate(
    applicationData: any,
    recipient: NotificationRecipient,
  ): Promise<void> {
    const context = {
      applicationId: applicationData.id,
      jobId: applicationData.jobId,
      jobTitle: applicationData.jobTitle,
      status: applicationData.status,
      companyName: applicationData.companyName,
    };

    await this.sendNotification('job_application_status_update', [recipient], context);
  }

  /**
   * Send security alert
   */
  public async sendSecurityAlert(
    alertMessage: string,
    recipient: NotificationRecipient,
  ): Promise<void> {
    const context = {
      alertMessage,
      timestamp: new Date().toISOString(),
    };

    await this.sendNotification('account_security_alert', [recipient], context);
  }

  /**
   * Broadcast system-wide notification
   */
  public async broadcastSystemNotification(
    notification: Partial<NotificationTemplate>,
    targetRole?: string,
  ): Promise<void> {
    const systemNotification = {
      id: `system_${Date.now()}`,
      type: 'system',
      title: notification.title || 'System Notification',
      message: notification.message || '',
      priority: notification.priority || 'normal',
      channels: ['in-app'],
      timestamp: Date.now(),
      ...notification,
    };

    if (targetRole) {
      this.wsServer.broadcastToRole(targetRole, 'system_notification', systemNotification);
    } else {
      this.wsServer.broadcastToAll('system_notification', systemNotification);
    }
  }

  /**
   * Get notification history for a user
   */
  public getNotificationHistory(userId: string, limit: number = 50): any[] {
    const history = this.notificationHistory.get(userId) || [];
    return history.slice(0, limit);
  }

  /**
   * Mark notification as read
   */
  public markAsRead(userId: string, notificationId: string): void {
    const history = this.notificationHistory.get(userId) || [];
    const notification = history.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
      notification.readAt = new Date();
    }
  }

  /**
   * Get unread notification count
   */
  public getUnreadCount(userId: string): number {
    const history = this.notificationHistory.get(userId) || [];
    return history.filter((n) => !n.read).length;
  }

  /**
   * Register a custom notification template
   */
  public registerTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Remove a notification template
   */
  public removeTemplate(templateId: string): void {
    this.templates.delete(templateId);
  }

  // Private helper methods

  private buildNotification(
    template: NotificationTemplate,
    recipient: NotificationRecipient,
    context: NotificationContext,
  ): any {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId: template.id,
      type: template.type,
      title: this.interpolateString(template.title, context),
      message: this.interpolateString(template.message, context),
      icon: template.icon,
      action: template.action
        ? {
            label: template.action.label,
            url: this.interpolateString(template.action.url, context),
          }
        : undefined,
      priority: template.priority,
      channels: this.filterChannelsByPreferences(template.channels, recipient.preferences),
      userId: recipient.userId,
      createdAt: new Date(),
      expiresAt: template.expiresAt,
      read: false,
      context,
    };

    return notification;
  }

  private async deliverNotification(
    notification: any,
    recipient: NotificationRecipient,
  ): Promise<void> {
    // Store in history
    if (!this.notificationHistory.has(recipient.userId)) {
      this.notificationHistory.set(recipient.userId, []);
    }
    const history = this.notificationHistory.get(recipient.userId)!;
    history.unshift(notification);

    // Keep only last 1000 notifications per user
    if (history.length > 1000) {
      history.splice(1000);
    }

    // Deliver via enabled channels
    for (const channel of notification.channels) {
      switch (channel) {
        case 'in-app':
          this.deliverInAppNotification(notification, recipient);
          break;
        case 'email':
          await this.deliverEmailNotification(notification, recipient);
          break;
        case 'push':
          await this.deliverPushNotification(notification, recipient);
          break;
        case 'sms':
          await this.deliverSMSNotification(notification, recipient);
          break;
      }
    }

    // Emit event for external listeners
    this.emit('notification_sent', {
      notification,
      recipient,
      channels: notification.channels,
    });
  }

  private deliverInAppNotification(notification: any, recipient: NotificationRecipient): void {
    this.wsServer.sendNotificationToUser(recipient.userId, notification);
  }

  private async deliverEmailNotification(
    notification: any,
    recipient: NotificationRecipient,
  ): Promise<void> {
    // This would integrate with your email service
    console.log(`📧 Email notification sent to ${recipient.email}: ${notification.title}`);

    // Emit event for email service to handle
    this.emit('email_notification', {
      to: recipient.email,
      subject: notification.title,
      content: notification.message,
      notification,
    });
  }

  private async deliverPushNotification(
    notification: any,
    recipient: NotificationRecipient,
  ): Promise<void> {
    // This would integrate with your push notification service (FCM, APNS, etc.)
    console.log(`📱 Push notification sent to user ${recipient.userId}: ${notification.title}`);

    // Emit event for push service to handle
    this.emit('push_notification', {
      userId: recipient.userId,
      title: notification.title,
      body: notification.message,
      data: notification.context,
      notification,
    });
  }

  private async deliverSMSNotification(
    notification: any,
    recipient: NotificationRecipient,
  ): Promise<void> {
    // This would integrate with your SMS service (Twilio, etc.)
    console.log(`📱 SMS notification sent to user ${recipient.userId}: ${notification.title}`);

    // Emit event for SMS service to handle
    this.emit('sms_notification', {
      userId: recipient.userId,
      message: `${notification.title}: ${notification.message}`,
      notification,
    });
  }

  private interpolateString(template: string, context: NotificationContext): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return context[key]?.toString() || match;
    });
  }

  private filterChannelsByPreferences(
    channels: string[],
    preferences: NotificationRecipient['preferences'],
  ): string[] {
    return channels.filter((channel) => {
      switch (channel) {
        case 'in-app':
          return preferences.inApp;
        case 'email':
          return preferences.email;
        case 'push':
          return preferences.push;
        case 'sms':
          return preferences.sms;
        default:
          return false;
      }
    });
  }

  private formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}

export default RealTimeNotificationService;
