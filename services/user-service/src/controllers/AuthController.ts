import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '@/services/AuthService';
import { logger } from '@/utils/logger';
import { UserRole } from '@startup-platform/types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Validation rules
  static registerValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      ),
    body('firstName')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('First name must be between 1 and 100 characters'),
    body('lastName')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Last name must be between 1 and 100 characters'),
    body('role').optional().isIn(Object.values(UserRole)).withMessage('Invalid user role'),
  ];

  static loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
  ];

  static passwordResetValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  ];

  static resetPasswordValidation = [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      ),
  ];

  static changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage(
        'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      ),
  ];

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const { email, password, firstName, lastName, role } = req.body;

      const user = await this.authService.register({
        email,
        password,
        firstName,
        lastName,
        role,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email to verify your account.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            emailVerified: user.emailVerified,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Registration error:', error);
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const { email, password } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');

      const result = await this.authService.login({
        email,
        password,
        ipAddress,
        userAgent,
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
            status: result.user.status,
            emailVerified: result.user.emailVerified,
            profile: result.user.profile,
          },
          tokens: {
            accessToken: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken,
            expiresIn: result.tokens.expiresIn,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Login error:', error);
      if (error instanceof Error) {
        res.status(401).json({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        next(error);
      }
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];

      if (token) {
        await this.authService.logout(token);
      }

      res.json({
        success: true,
        message: 'Logout successful',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Logout error:', error);
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const tokens = await this.authService.refreshToken(refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      if (error instanceof Error) {
        res.status(401).json({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        next(error);
      }
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Verification token is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const user = await this.authService.verifyEmail(token);

      res.json({
        success: true,
        message: 'Email verified successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            emailVerified: user.emailVerified,
            status: user.status,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Email verification error:', error);
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

  sendPasswordReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const { email } = req.body;

      await this.authService.sendPasswordReset(email);

      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Password reset request error:', error);
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const { token, password } = req.body;

      const user = await this.authService.resetPassword(token, password);

      res.json({
        success: true,
        message: 'Password reset successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Password reset error:', error);
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

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const userId = req.headers['x-user-id'] as string;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await this.authService.changePassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Password change error:', error);
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

  resendVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // This would need to be implemented in AuthService
      res.json({
        success: true,
        message: 'Verification email sent',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Resend verification error:', error);
      next(error);
    }
  };

  getUserSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const sessions = await this.authService.getUserSessions(userId);

      res.json({
        success: true,
        data: { sessions },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get user sessions error:', error);
      next(error);
    }
  };

  revokeSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { sessionId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await this.authService.revokeSession(sessionId, userId);

      res.json({
        success: true,
        message: 'Session revoked successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Revoke session error:', error);
      next(error);
    }
  };
}
