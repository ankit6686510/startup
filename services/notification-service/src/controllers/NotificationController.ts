import { Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { NotificationService, NotificationFilters } from '@/services/NotificationService';
import { logger } from '@/utils/logger';
import { 
  NotificationType, 
  NotificationPriority, 
  NotificationCategory,
  NotificationStatus 
} from '@/models/Notification';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  // Validation rules
  static createNotificationValidation = [
    body('recipientId').notEmpty().withMessage('Recipient ID is required'),
    body('type').isIn(Object.values(NotificationType)).withMessage('Invalid notification type'),
    body('title').isLength({ min: 1, max: 500 }).withMessage('Title must be between 1 and 500 characters'),
    body('content').isLength({ min: 1 }).withMessage('Content is required'),
    body('priority').optional().isIn(Object.values(NotificationPriority)).withMessage('Invalid priority'),
    body('category').optional().isIn(Object.values(NotificationCategory)).withMessage('Invalid category'),
    body('scheduledAt').optional().isISO8601().withMessage('Invalid scheduled date'),
    body('expiresAt').optional().isISO8601().withMessage('Invalid expiration date'),
    body('recipientEmail').optional().isEmail().withMessage('Invalid email address'),
    body('recipientPhone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  ];

  static getNotificationsValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('types').optional().custom((value) => {
      if (typeof value === 'string') {
        return Object.values(NotificationType).includes(value as NotificationType);
      }
      if (Array.isArray(value)) {
        return value.every(type => Object.values(NotificationType).includes(type));
      }
      return false;
    }).withMessage('Invalid notification types'),
    query('statuses').optional().custom((value) => {
      if (typeof value === 'string') {
        return Object.values(NotificationStatus).includes(value as NotificationStatus);
      }
      if (Array.isArray(value)) {
        return value.every(status => Object.values(NotificationStatus).includes(status));
      }
      return false;
    }).withMessage('Invalid notification statuses'),
  ];

  createNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const notification = await this.notificationService.createNotification(req.body);

      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        data: { notification: notification.toSummary() },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Create notification error:', error);
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        next(error);
      }
    }
  };

  sendNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await this.notificationService.sendNotification(id);

      res.json({
        success: true,
        message: success ? 'Notification sent successfully' : 'Failed to send notification',
        data: { sent: success },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Send notification error:', error);
      if (error instanceof Error) {
        res.status(404).json({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        next(error);
      }
    }
  };

  retryNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await this.notificationService.retryNotification(id);

      res.json({
        success: true,
        message: success ? 'Notification retried successfully' : 'Failed to retry notification',
        data: { retried: success },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Retry notification error:', error);
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        next(error);
      }
    }
  };

  cancelNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      await this.notificationService.cancelNotification(id, reason);

      res.json({
        success: true,
        message: 'Notification cancelled successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Cancel notification error:', error);
      if (error instanceof Error) {
        res.status(404).json({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        next(error);
      }
    }
  };

  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const filters: NotificationFilters = {};
      if (req.query.recipientIds) {
        filters.recipientIds = Array.isArray(req.query.recipientIds) 
          ? req.query.recipientIds as string[] 
          : [req.query.recipientIds as string];
      }
      if (req.query.types) {
        filters.types = Array.isArray(req.query.types) 
          ? req.query.types as NotificationType[] 
          : [req.query.types as NotificationType];
      }
      if (req.query.statuses) {
        filters.statuses = Array.isArray(req.query.statuses) 
          ? req.query.statuses as NotificationStatus[] 
          : [req.query.statuses as NotificationStatus];
      }
      if (req.query.priorities) {
        filters.priorities = Array.isArray(req.query.priorities) 
          ? req.query.priorities as NotificationPriority[] 
          : [req.query.priorities as NotificationPriority];
      }
      if (req.query.categories) {
        filters.categories = Array.isArray(req.query.categories) 
          ? req.query.categories as NotificationCategory[] 
          : [req.query.categories as NotificationCategory];
      }
      if (req.query.dateFrom) filters.dateFrom = new Date(req.query.dateFrom as string);
      if (req.query.dateTo) filters.dateTo = new Date(req.query.dateTo as string);
      if (req.query.campaignId) filters.campaignId = req.query.campaignId as string;
      if (req.query.tags) {
        filters.tags = Array.isArray(req.query.tags) 
          ? req.query.tags as string[] 
          : [req.query.tags as string];
      }

      const { notifications, total } = await this.notificationService.getNotifications(filters, page, limit);

      res.json({
        success: true,
        data: { 
          notifications: notifications.map(n => n.toSummary()) 
        },
        meta: {
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          filters,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get notifications error:', error);
      next(error);
    }
  };

  getUserNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { notifications, total } = await this.notificationService.getUserNotifications(userId, page, limit);

      res.json({
        success: true,
        data: { 
          notifications: notifications.map(n => n.toSummary()) 
        },
        meta: {
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get user notifications error:', error);
      next(error);
    }
  };

  markAsDelivered = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { providerData } = req.body;

      await this.notificationService.markAsDelivered(id, providerData);

      res.json({
        success: true,
        message: 'Notification marked as delivered',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Mark as delivered error:', error);
      if (error instanceof Error) {
        res.status(404).json({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        next(error);
      }
    }
  };

  markAsOpened = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const trackingData = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date(),
        ...req.body,
      };

      await this.notificationService.markAsOpened(id, trackingData);

      res.json({
        success: true,
        message: 'Notification marked as opened',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Mark as opened error:', error);
      if (error instanceof Error) {
        res.status(404).json({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        next(error);
      }
    }
  };

  markAsClicked = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const trackingData = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date(),
        ...req.body,
      };

      await this.notificationService.markAsClicked(id, trackingData);

      res.json({
        success: true,
        message: 'Notification marked as clicked',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Mark as clicked error:', error);
      if (error instanceof Error) {
        res.status(404).json({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        next(error);
      }
    }
  };

  getNotificationStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.query;
      const stats = await this.notificationService.getNotificationStats(userId as string);

      res.json({
        success: true,
        data: { stats },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get notification stats error:', error);
      next(error);
    }
  };
}