import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', AuthController.registerValidation, authController.register);
router.post('/login', AuthController.loginValidation, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/verify-email', authController.verifyEmail);
router.post('/forgot-password', AuthController.passwordResetValidation, authController.sendPasswordReset);
router.post('/reset-password', AuthController.resetPasswordValidation, authController.resetPassword);

// Protected routes (require authentication)
router.post('/change-password', AuthController.changePasswordValidation, authController.changePassword);
router.post('/resend-verification', authController.resendVerification);
router.get('/sessions', authController.getUserSessions);
router.delete('/sessions/:sessionId', authController.revokeSession);

export default router;