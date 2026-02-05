import nodemailer from 'nodemailer';
import { User } from '@/models/User';
import { logger } from '@/utils/logger';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;
  private fromName: string;
  private frontendUrl: string;

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@startupcompass.com';
    this.fromName = process.env.FROM_NAME || 'StartupCompass';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmailVerification(user: User, token: string): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;

    const template = this.generateEmailVerificationTemplate(user, verificationUrl);

    await this.sendEmail(user.email, template);
    logger.info(`Email verification sent to: ${user.email}`);
  }

  async sendPasswordReset(user: User, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

    const template = this.generatePasswordResetTemplate(user, resetUrl);

    await this.sendEmail(user.email, template);
    logger.info(`Password reset email sent to: ${user.email}`);
  }

  async sendWelcomeEmail(user: User): Promise<void> {
    const template = this.generateWelcomeTemplate(user);

    await this.sendEmail(user.email, template);
    logger.info(`Welcome email sent to: ${user.email}`);
  }

  async sendPasswordChangedNotification(user: User): Promise<void> {
    const template = this.generatePasswordChangedTemplate(user);

    await this.sendEmail(user.email, template);
    logger.info(`Password changed notification sent to: ${user.email}`);
  }

  private async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  private generateEmailVerificationTemplate(user: User, verificationUrl: string): EmailTemplate {
    const displayName = user.profile?.displayName || user.profile?.fullName || 'there';

    return {
      subject: 'Verify your email address - StartupCompass',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
            .logo { font-size: 24px; font-weight: bold; color: #4F46E5; }
            .content { padding: 30px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { border-top: 1px solid #eee; padding: 20px 0; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">StartupCompass</div>
            </div>
            <div class="content">
              <h1>Welcome to StartupCompass, ${displayName}!</h1>
              <p>Thanks for signing up! Please verify your email address to complete your registration and start exploring the startup ecosystem.</p>
              <p>Click the button below to verify your email address:</p>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p><a href="${verificationUrl}">${verificationUrl}</a></p>
              <p>This verification link will expire in 24 hours for security reasons.</p>
              <p>If you didn't create an account with us, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 StartupCompass. All rights reserved.</p>
              <p>If you have any questions, contact us at support@startupcompass.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to StartupCompass, ${displayName}!
        
        Thanks for signing up! Please verify your email address to complete your registration.
        
        Click this link to verify your email: ${verificationUrl}
        
        This verification link will expire in 24 hours for security reasons.
        
        If you didn't create an account with us, please ignore this email.
        
        © 2024 StartupCompass. All rights reserved.
      `
    };
  }

  private generatePasswordResetTemplate(user: User, resetUrl: string): EmailTemplate {
    const displayName = user.profile?.displayName || user.profile?.fullName || 'there';

    return {
      subject: 'Reset your password - StartupCompass',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
            .logo { font-size: 24px; font-weight: bold; color: #4F46E5; }
            .content { padding: 30px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #DC2626; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { border-top: 1px solid #eee; padding: 20px 0; text-align: center; color: #666; font-size: 14px; }
            .warning { background: #FEF2F2; border: 1px solid #FECACA; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">StartupCompass</div>
            </div>
            <div class="content">
              <h1>Reset Your Password</h1>
              <p>Hi ${displayName},</p>
              <p>We received a request to reset your password for your StartupCompass account.</p>
              <p>Click the button below to create a new password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <div class="warning">
                <strong>Important:</strong> This password reset link will expire in 1 hour for security reasons.
              </div>
              <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 StartupCompass. All rights reserved.</p>
              <p>If you have any questions, contact us at support@startupcompass.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Reset Your Password - StartupCompass
        
        Hi ${displayName},
        
        We received a request to reset your password for your StartupCompass account.
        
        Click this link to reset your password: ${resetUrl}
        
        This password reset link will expire in 1 hour for security reasons.
        
        If you didn't request a password reset, please ignore this email.
        
        © 2024 StartupCompass. All rights reserved.
      `
    };
  }

  private generateWelcomeTemplate(user: User): EmailTemplate {
    const displayName = user.profile?.displayName || user.profile?.fullName || 'there';

    return {
      subject: 'Welcome to StartupCompass! 🚀',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to StartupCompass</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
            .logo { font-size: 24px; font-weight: bold; color: #4F46E5; }
            .content { padding: 30px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .feature { margin: 20px 0; padding: 15px; background: #F8FAFC; border-radius: 6px; }
            .footer { border-top: 1px solid #eee; padding: 20px 0; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">StartupCompass</div>
            </div>
            <div class="content">
              <h1>Welcome to StartupCompass! 🚀</h1>
              <p>Hi ${displayName},</p>
              <p>Your email has been verified and your account is now active! Welcome to the StartupCompass community.</p>
              
              <h2>What's next?</h2>
              <div class="feature">
                <h3>🏢 Explore Startups</h3>
                <p>Discover innovative startups across various industries and stages.</p>
              </div>
              <div class="feature">
                <h3>💼 Find Opportunities</h3>
                <p>Browse job openings at exciting startups and scale-ups.</p>
              </div>
              <div class="feature">
                <h3>📰 Stay Updated</h3>
                <p>Get the latest news and insights from the startup ecosystem.</p>
              </div>
              
              <a href="${this.frontendUrl}/dashboard" class="button">Go to Dashboard</a>
              
              <p>We're excited to have you on board and can't wait to see what you discover!</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 StartupCompass. All rights reserved.</p>
              <p>Follow us on social media for the latest updates!</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to StartupCompass! 🚀
        
        Hi ${displayName},
        
        Your email has been verified and your account is now active! Welcome to the StartupCompass community.
        
        What's next?
        - Explore innovative startups across various industries
        - Find job opportunities at exciting companies
        - Stay updated with startup news and insights
        
        Visit your dashboard: ${this.frontendUrl}/dashboard
        
        We're excited to have you on board!
        
        © 2024 StartupCompass. All rights reserved.
      `
    };
  }

  private generatePasswordChangedTemplate(user: User): EmailTemplate {
    const displayName = user.profile?.displayName || user.profile?.fullName || 'there';

    return {
      subject: 'Password changed - StartupCompass',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Changed</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
            .logo { font-size: 24px; font-weight: bold; color: #4F46E5; }
            .content { padding: 30px 0; }
            .success { background: #F0FDF4; border: 1px solid #BBF7D0; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { border-top: 1px solid #eee; padding: 20px 0; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">StartupCompass</div>
            </div>
            <div class="content">
              <h1>Password Changed Successfully</h1>
              <p>Hi ${displayName},</p>
              <div class="success">
                Your password has been successfully changed on ${new Date().toLocaleDateString()}.
              </div>
              <p>If you made this change, no further action is required.</p>
              <p>If you didn't change your password, please contact our support team immediately at support@startupcompass.com</p>
              <p>For your security, all existing sessions have been logged out.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 StartupCompass. All rights reserved.</p>
              <p>If you have any questions, contact us at support@startupcompass.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Changed Successfully - StartupCompass
        
        Hi ${displayName},
        
        Your password has been successfully changed on ${new Date().toLocaleDateString()}.
        
        If you made this change, no further action is required.
        
        If you didn't change your password, please contact our support team immediately at support@startupcompass.com
        
        For your security, all existing sessions have been logged out.
        
        © 2024 StartupCompass. All rights reserved.
      `
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }
}