import nodemailer from 'nodemailer';
import { logger } from '@/utils/logger';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: string[];
  trackingId?: string;
  metadata?: Record<string, any>;
}

export class EmailProvider {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@startupcompass.com';
    this.fromName = process.env.FROM_NAME || 'StartupCompass';

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

  async send(data: EmailData): Promise<boolean> {
    try {
      const mailOptions: any = {
        from: data.from || `"${this.fromName}" <${this.fromEmail}>`,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
        replyTo: data.replyTo,
        cc: data.cc,
        bcc: data.bcc,
        attachments: data.attachments?.map((url) => ({ path: url })),
        headers: {
          'X-Tracking-ID': data.trackingId || '',
          'X-Metadata': JSON.stringify(data.metadata || {}),
        },
      };

      const result = await this.transporter.sendMail(mailOptions);

      logger.info(`Email sent successfully to ${data.to}`, {
        messageId: result.messageId,
        trackingId: data.trackingId,
      });

      return true;
    } catch (error) {
      logger.error(`Failed to send email to ${data.to}:`, error);
      return false;
    }
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
