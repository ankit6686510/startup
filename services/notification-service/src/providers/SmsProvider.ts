import { Twilio } from 'twilio';
import { logger } from '@/utils/logger';

export interface SmsData {
  to: string;
  message: string;
  from?: string;
  trackingId?: string;
}

export class SmsProvider {
  private client: Twilio | null = null;
  private fromNumber: string;

  constructor() {
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;

    if (sid && token && sid.startsWith('AC') && !sid.includes('your-twilio')) {
      this.client = new Twilio(sid, token);
    } else {
      logger.warn('Twilio credentials not configured or are invalid. SMS will be disabled.');
    }
  }

  async send(data: SmsData): Promise<boolean> {
    if (!this.client) {
      logger.error('SMS provider not configured - missing Twilio credentials');
      return false;
    }

    try {
      const message = await this.client.messages.create({
        body: data.message,
        from: data.from || this.fromNumber,
        to: data.to,
      });

      logger.info(`SMS sent successfully to ${data.to}`, {
        messageSid: message.sid,
        trackingId: data.trackingId,
      });

      return true;
    } catch (error) {
      logger.error(`Failed to send SMS to ${data.to}:`, error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      // Test by fetching account info
      await this.client.api.accounts(process.env.TWILIO_ACCOUNT_SID!).fetch();
      logger.info('SMS service connection verified');
      return true;
    } catch (error) {
      logger.error('SMS service connection failed:', error);
      return false;
    }
  }
}