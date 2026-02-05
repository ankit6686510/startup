import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '@/models/User';
import { logger } from './logger';

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export class JWTUtil {
  static generateAccessToken(user: User): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as any,
      issuer: 'startupcompass',
      audience: 'startupcompass-users',
    });
  }

  static generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateTokenPair(user: User): TokenPair {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken();

    // Calculate expiration times
    const expiresIn = this.getExpirationTime(JWT_EXPIRES_IN);
    const refreshExpiresIn = this.getExpirationTime(JWT_REFRESH_EXPIRES_IN);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      refreshExpiresIn,
    };
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET, {
        issuer: 'startupcompass',
        audience: 'startupcompass-users',
      }) as JWTPayload;
    } catch (error) {
      logger.error('JWT verification failed:', error);
      throw new Error('Invalid token');
    }
  }

  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      logger.error('JWT decode failed:', error);
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded) return true;

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  private static getExpirationTime(duration: string): number {
    // Convert duration string to milliseconds
    const units: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid duration format: ${duration}`);
    }

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }

  static getTokenExpirationDate(duration: string): Date {
    const expirationTime = this.getExpirationTime(duration);
    return new Date(Date.now() + expirationTime);
  }

  static generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
