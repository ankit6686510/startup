import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export interface TwoFactorVerification {
  isValid: boolean;
  usedBackupCode?: string;
}

export class TwoFactorAuthService {
  private serviceName: string;
  private issuer: string;

  constructor(serviceName: string = 'StartupCompass', issuer: string = 'StartupCompass Platform') {
    this.serviceName = serviceName;
    this.issuer = issuer;
  }

  /**
   * Generate a new 2FA secret and QR code for user setup
   */
  async generateSecret(userEmail: string, userId: string): Promise<TwoFactorSetup> {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${this.serviceName} (${userEmail})`,
      issuer: this.issuer,
      length: 32,
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    return {
      secret: secret.base32!,
      qrCodeUrl,
      backupCodes,
      manualEntryKey: secret.base32!,
    };
  }

  /**
   * Verify a TOTP token
   */
  verifyToken(secret: string, token: string, window: number = 2): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window, // Allow some time drift
    });
  }

  /**
   * Verify a token or backup code
   */
  verifyTokenOrBackupCode(
    secret: string,
    token: string,
    backupCodes: string[],
  ): TwoFactorVerification {
    // First try TOTP verification
    if (this.verifyToken(secret, token)) {
      return { isValid: true };
    }

    // Then try backup codes
    const hashedToken = this.hashBackupCode(token);
    const matchingCodeIndex = backupCodes.findIndex((code) => code === hashedToken);

    if (matchingCodeIndex !== -1) {
      return {
        isValid: true,
        usedBackupCode: backupCodes[matchingCodeIndex],
      };
    }

    return { isValid: false };
  }

  /**
   * Generate backup codes for 2FA recovery
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      const formattedCode = `${code.slice(0, 4)}-${code.slice(4)}`;

      // Hash the code for storage
      const hashedCode = this.hashBackupCode(formattedCode);
      codes.push(hashedCode);
    }

    return codes;
  }

  /**
   * Hash a backup code for secure storage
   */
  private hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  /**
   * Generate a recovery code for disabling 2FA
   */
  generateRecoveryCode(): string {
    return crypto.randomBytes(16).toString('hex').toUpperCase();
  }

  /**
   * Validate recovery code format
   */
  isValidRecoveryCode(code: string): boolean {
    return /^[A-F0-9]{32}$/.test(code);
  }

  /**
   * Generate time-based one-time password for testing
   */
  generateTOTP(secret: string): string {
    return speakeasy.totp({
      secret,
      encoding: 'base32',
    });
  }

  /**
   * Check if 2FA setup is complete and valid
   */
  validateSetup(secret: string, verificationToken: string): boolean {
    return this.verifyToken(secret, verificationToken);
  }

  /**
   * Generate QR code URL without creating image
   */
  generateQRCodeUrl(userEmail: string, secret: string): string {
    return speakeasy.otpauthURL({
      secret,
      label: `${this.serviceName} (${userEmail})`,
      issuer: this.issuer,
      encoding: 'base32',
    });
  }
}

// Middleware for enforcing 2FA
export const require2FA = (req: any, res: any, next: any) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
    });
  }

  // Check if user has 2FA enabled
  if (!user.twoFactorEnabled) {
    return res.status(403).json({
      success: false,
      error: '2FA is required for this action',
      code: 'TWO_FACTOR_REQUIRED',
      setupUrl: '/auth/2fa/setup',
    });
  }

  // Check if current session is 2FA verified
  if (!req.session?.twoFactorVerified) {
    return res.status(403).json({
      success: false,
      error: '2FA verification required',
      code: 'TWO_FACTOR_VERIFICATION_REQUIRED',
      verifyUrl: '/auth/2fa/verify',
    });
  }

  next();
};

// Middleware for optional 2FA (step-up authentication)
export const stepUp2FA = (req: any, res: any, next: any) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
    });
  }

  // If user has 2FA enabled, require verification
  if (user.twoFactorEnabled && !req.session?.twoFactorVerified) {
    return res.status(403).json({
      success: false,
      error: '2FA verification required for this sensitive action',
      code: 'STEP_UP_REQUIRED',
      verifyUrl: '/auth/2fa/verify',
    });
  }

  next();
};

// Rate limiting for 2FA attempts
export class TwoFactorRateLimit {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier);

    if (!attempts) {
      return false;
    }

    if (now > attempts.resetTime) {
      this.attempts.delete(identifier);
      return false;
    }

    return attempts.count >= this.maxAttempts;
  }

  recordAttempt(identifier: string): void {
    const now = Date.now();
    const attempts = this.attempts.get(identifier);

    if (!attempts || now > attempts.resetTime) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
    } else {
      attempts.count++;
    }
  }

  getRemainingTime(identifier: string): number {
    const attempts = this.attempts.get(identifier);
    if (!attempts) return 0;

    return Math.max(0, attempts.resetTime - Date.now());
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Utility functions for 2FA management
export const twoFactorUtils = {
  /**
   * Format backup codes for display
   */
  formatBackupCodes(codes: string[]): string[] {
    return codes.map((code) => {
      // Convert hash back to display format (this is for display only)
      // In practice, you'd store the original codes temporarily during setup
      return code
        .slice(0, 8)
        .toUpperCase()
        .replace(/(.{4})/, '$1-');
    });
  },

  /**
   * Validate TOTP token format
   */
  isValidTOTPFormat(token: string): boolean {
    return /^\d{6}$/.test(token);
  },

  /**
   * Validate backup code format
   */
  isValidBackupCodeFormat(code: string): boolean {
    return /^[A-F0-9]{4}-[A-F0-9]{4}$/.test(code);
  },

  /**
   * Generate secure random string for various purposes
   */
  generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  },

  /**
   * Time-safe string comparison
   */
  timeSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  },
};

export default TwoFactorAuthService;
