import { Router } from 'express';
import { NotificationController } from '@/controllers/NotificationController';

const router = Router();
const notificationController = new NotificationController();

// Notification CRUD routes
router.post('/', NotificationController.createNotificationValidation, notificationController.createNotification);
router.get('/', NotificationController.getNotificationsValidation, notificationController.getNotifications);
router.get('/stats', notificationController.getNotificationStats);
router.get('/user/:userId', notificationController.getUserNotifications);
router.get('/:id', notificationController.getNotificationById);
router.post('/:id/send', notificationController.sendNotification);
router.post('/:id/retry', notificationController.retryNotification);
router.post('/:id/cancel', notificationController.cancelNotification);
router.post('/:id/delivered', notificationController.markAsDelivered);
router.post('/:id/opened', notificationController.markAsOpened);
router.post('/:id/clicked', notificationController.markAsClicked);

export default router;