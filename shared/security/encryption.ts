import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { promisify } from 'util';

export interface EncryptionResult {
  encrypted: string;
  iv: string;
  tag?: string;
}

export interface DecryptionParams {
  encrypted: string;
  iv: string;
  tag?: string;
}

export class EncryptionService {
  private algorithm: string;
  private keyLength: number;
  private ivLength: number;

  constructor(algorithm: string = 'aes-256-gcm') {
    this.algorithm = algorithm;
    this.keyLength = 32; // 256 bits
    this.ivLength = 16;  // 128 bits
  }

  /**
   * Generate a cryptographically secure random key
   */
  generateKey(): string {
    return crypto.randomBytes(this.keyLength).toString('hex');
  }

  /**
   * Generate a random initialization vector
   */
  generateIV(): string {
    return crypto.randomBytes(this.ivLength).toString('hex');
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  encrypt(data: string, key: string): EncryptionResult {
    const keyBuffer = Buffer.from(key, 'hex');
    const iv = crypto.randomBytes(this.ivLength);
    
    const cipher = crypto.createCipher(this.algorithm, keyBuffer);
    cipher.setAAD(Buffer.from('StartupCompass', 'utf8'));
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  decrypt(params: DecryptionParams, key: string): string {
    const keyBuffer = Buffer.from(key, 'hex');
    const iv = Buffer.from(params.iv, 'hex');
    const tag = Buffer.from(params.tag || '', 'hex');
    
    const decipher = crypto.createDecipher(this.algorithm, keyBuffer);
    decipher.setAAD(Buffer.from('StartupCompass', 'utf8'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(params.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Encrypt data with password-based encryption
   */
  encryptWithPassword(data: string, password: string): EncryptionResult {
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(password, salt, 100000, this.keyLength, 'sha256');
    const iv = crypto.randomBytes(this.ivLength);
    
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(salt);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: Buffer.concat([salt, iv]).toString('hex'),
      tag: tag.toString('hex')
    };
  }

  /**
   * Decrypt data with password-based encryption
   */
  decryptWithPassword(params: DecryptionParams, password: string): string {
    const combined = Buffer.from(params.iv, 'hex');
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16);
    
    const key = crypto.pbkdf2Sync(password, salt, 100000, this.keyLength, 'sha256');
    const tag = Buffer.from(params.tag || '', 'hex');
    
    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAAD(salt);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(params.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Hash data using SHA-256
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Create HMAC signature
   */
  createHMAC(data: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  verifyHMAC(data: string, signature: string, secret: string): boolean {
    const expectedSignature = this.createHMAC(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Generate cryptographically secure random string
   */
  generateRandomString(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate random UUID
   */
  generateUUID(): string {
    return crypto.randomUUID();
  }
}

export class PasswordService {
  private saltRounds: number;

  constructor(saltRounds: number = 12) {
    this.saltRounds = saltRounds;
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Check password strength
   */
  checkPasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Password should be at least 8 characters long');
    }

    if (password.length >= 12) {
      score += 1;
    }

    // Character variety checks
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password should contain lowercase letters');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password should contain uppercase letters');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password should contain numbers');
    }

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password should contain special characters');
    }

    // Common patterns check
    if (!/(.)\1{2,}/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password should not contain repeated characters');
    }

    // Sequential characters check
    if (!/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i.test(password)) {
      score += 1;
    } else {
      feedback.push('Password should not contain sequential characters');
    }

    const isStrong = score >= 6;

    return {
      score,
      feedback,
      isStrong
    };
  }

  /**
   * Generate secure random password
   */
  generateSecurePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    
    let password = '';
    
    // Ensure at least one character from each category
    password += lowercase[crypto.randomInt(0, lowercase.length)];
    password += uppercase[crypto.randomInt(0, uppercase.length)];
    password += numbers[crypto.randomInt(0, numbers.length)];
    password += symbols[crypto.randomInt(0, symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[crypto.randomInt(0, allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => crypto.randomInt(0, 2) - 0.5).join('');
  }
}

export class TokenService {
  private encryptionService: EncryptionService;

  constructor() {
    this.encryptionService = new EncryptionService();
  }

  /**
   * Generate secure token with expiration
   */
  generateToken(payload: any, expiresIn: number = 3600): string {
    const tokenData = {
      payload,
      expiresAt: Date.now() + (expiresIn * 1000),
      nonce: this.encryptionService.generateRandomString(16)
    };

    const tokenString = JSON.stringify(tokenData);
    const key = process.env.TOKEN_ENCRYPTION_KEY || this.encryptionService.generateKey();
    
    const encrypted = this.encryptionService.encrypt(tokenString, key);
    
    return Buffer.from(JSON.stringify(encrypted)).toString('base64url');
  }

  /**
   * Verify and decode token
   */
  verifyToken(token: string): { isValid: boolean; payload?: any; error?: string } {
    try {
      const encryptedData = JSON.parse(Buffer.from(token, 'base64url').toString());
      const key = process.env.TOKEN_ENCRYPTION_KEY || this.encryptionService.generateKey();
      
      const decrypted = this.encryptionService.decrypt(encryptedData, key);
      const tokenData = JSON.parse(decrypted);
      
      // Check expiration
      if (Date.now() > tokenData.expiresAt) {
        return { isValid: false, error: 'Token expired' };
      }
      
      return { isValid: true, payload: tokenData.payload };
    } catch (error) {
      return { isValid: false, error: 'Invalid token' };
    }
  }

  /**
   * Generate API key
   */
  generateAPIKey(): string {
    const prefix = 'sk_';
    const randomPart = this.encryptionService.generateRandomString(32);
    return prefix + randomPart;
  }

  /**
   * Generate session token
   */
  generateSessionToken(): string {
    return this.encryptionService.generateRandomString(64);
  }
}

export class DataProtection {
  private encryptionService: EncryptionService;

  constructor() {
    this.encryptionService = new EncryptionService();
  }

  /**
   * Encrypt sensitive data for storage
   */
  encryptSensitiveData(data: any): string {
    const key = process.env.DATA_ENCRYPTION_KEY || this.encryptionService.generateKey();
    const jsonData = JSON.stringify(data);
    const encrypted = this.encryptionService.encrypt(jsonData, key);
    
    return Buffer.from(JSON.stringify(encrypted)).toString('base64');
  }

  /**
   * Decrypt sensitive data from storage
   */
  decryptSensitiveData(encryptedData: string): any {
    try {
      const key = process.env.DATA_ENCRYPTION_KEY || this.encryptionService.generateKey();
      const encrypted = JSON.parse(Buffer.from(encryptedData, 'base64').toString());
      const decrypted = this.encryptionService.decrypt(encrypted, key);
      
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error('Failed to decrypt sensitive data');
    }
  }

  /**
   * Mask sensitive data for logging
   */
  maskSensitiveData(data: any, fields: string[] = ['password', 'token', 'secret', 'key']): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const masked = { ...data };

    for (const field of fields) {
      if (field in masked) {
        const value = masked[field];
        if (typeof value === 'string' && value.length > 0) {
          masked[field] = value.substring(0, 2) + '*'.repeat(Math.max(0, value.length - 4)) + value.substring(Math.max(2, value.length - 2));
        }
      }
    }

    return masked;
  }

  /**
   * Generate data integrity hash
   */
  generateIntegrityHash(data: any): string {
    const jsonData = JSON.stringify(data, Object.keys(data).sort());
    return this.encryptionService.hash(jsonData);
  }

  /**
   * Verify data integrity
   */
  verifyIntegrity(data: any, expectedHash: string): boolean {
    const actualHash = this.generateIntegrityHash(data);
    return actualHash === expectedHash;
  }

  /**
   * Securely delete sensitive data from memory
   */
  secureDelete(obj: any): void {
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'string') {
            // Overwrite string with random data
            obj[key] = crypto.randomBytes(obj[key].length).toString('hex');
          }
          delete obj[key];
        }
      }
    }
  }
}

// Utility functions
export const securityUtils = {
  /**
   * Generate secure random bytes
   */
  randomBytes: (size: number): Buffer => crypto.randomBytes(size),

  /**
   * Constant-time string comparison
   */
  timingSafeEqual: (a: string, b: string): boolean => {
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  },

  /**
   * Generate cryptographically secure random integer
   */
  randomInt: (min: number, max: number): number => crypto.randomInt(min, max),

  /**
   * Validate UUID format
   */
  isValidUUID: (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  /**
   * Sanitize filename for safe storage
   */
  sanitizeFilename: (filename: string): string => {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 255);
  },

  /**
   * Generate secure file upload token
   */
  generateUploadToken: (userId: string, filename: string): string => {
    const tokenService = new TokenService();
    return tokenService.generateToken({ userId, filename }, 3600); // 1 hour expiry
  }
};

// Export singleton instances
export const encryptionService = new EncryptionService();
export const passwordService = new PasswordService();
export const tokenService = new TokenService();
export const dataProtection = new DataProtection();

export default {
  EncryptionService,
  PasswordService,
  TokenService,
  DataProtection,
  securityUtils
};