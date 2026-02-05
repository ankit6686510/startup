import { Repository } from 'typeorm';
import { AppDataSource } from '@/config/database';
import { User } from '@/models/User';
import { UserProfile } from '@/models/UserProfile';
import { UserSession } from '@/models/UserSession';
import { EmailVerification } from '@/models/EmailVerification';
import { PasswordReset } from '@/models/PasswordReset';
import { JWTUtil, TokenPair } from '@/utils/jwt';
import { EmailService } from './EmailService';
import { logger } from '@/utils/logger';
import { UserRole, UserStatus } from '@startup-platform/types';
import crypto from 'crypto';

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthResult {
  user: User;
  tokens: TokenPair;
  session: UserSession;
}

export class AuthService {
  private userRepository: Repository<User>;
  private profileRepository: Repository<UserProfile>;
  private sessionRepository: Repository<UserSession>;
  private emailVerificationRepository: Repository<EmailVerification>;
  private passwordResetRepository: Repository<PasswordReset>;
  private emailService: EmailService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.profileRepository = AppDataSource.getRepository(UserProfile);
    this.sessionRepository = AppDataSource.getRepository(UserSession);
    this.emailVerificationRepository = AppDataSource.getRepository(EmailVerification);
    this.passwordResetRepository = AppDataSource.getRepository(PasswordReset);
    this.emailService = new EmailService();
  }

  async register(data: RegisterData): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email.toLowerCase() }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user
    const user = this.userRepository.create({
      email: data.email.toLowerCase(),
      password: data.password,
      role: data.role || UserRole.USER,
      status: UserStatus.PENDING_VERIFICATION,
    });

    const savedUser = await this.userRepository.save(user);

    // Create user profile
    const profile = this.profileRepository.create({
      user: savedUser,
      firstName: data.firstName,
      lastName: data.lastName,
      displayName: data.firstName && data.lastName ?
        `${data.firstName} ${data.lastName}` :
        data.firstName || data.lastName,
    });

    await this.profileRepository.save(profile);

    // Send verification email
    await this.sendEmailVerification(savedUser);

    logger.info(`User registered: ${savedUser.email}`);
    return savedUser;
  }

  async login(data: LoginData): Promise<AuthResult> {
    const user = await this.userRepository.findOne({
      where: { email: data.email.toLowerCase() },
      relations: ['profile']
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (user.isLocked()) {
      throw new Error('Account is temporarily locked due to too many failed attempts');
    }

    // Verify password
    const isValidPassword = await user.comparePassword(data.password);
    if (!isValidPassword) {
      user.incrementFailedAttempts();
      await this.userRepository.save(user);
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is not active');
    }

    // Update login info
    user.updateLastLogin(data.ipAddress);
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = JWTUtil.generateTokenPair(user);

    // Create session
    const session = await this.createSession(user, tokens, data);

    logger.info(`User logged in: ${user.email}`);
    return { user, tokens, session };
  }

  async logout(sessionToken: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { token: sessionToken }
    });

    if (session) {
      session.revoke(undefined, 'User logout');
      await this.sessionRepository.save(session);
      logger.info(`Session revoked: ${session.id}`);
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    const session = await this.sessionRepository.findOne({
      where: { refreshToken },
      relations: ['user']
    });

    if (!session || !session.isValid() || session.isRefreshExpired()) {
      throw new Error('Invalid refresh token');
    }

    // Generate new token pair
    const tokens = JWTUtil.generateTokenPair(session.user);

    // Update session
    session.token = tokens.accessToken;
    session.refreshToken = tokens.refreshToken;
    session.expiresAt = JWTUtil.getTokenExpirationDate(process.env.JWT_EXPIRES_IN || '7d');
    session.refreshExpiresAt = JWTUtil.getTokenExpirationDate(process.env.JWT_REFRESH_EXPIRES_IN || '30d');
    session.updateLastUsed();

    await this.sessionRepository.save(session);

    logger.info(`Token refreshed for user: ${session.user.email}`);
    return tokens;
  }

  async sendEmailVerification(user: User): Promise<void> {
    // Invalidate existing verifications
    await this.emailVerificationRepository.update(
      { user: { id: user.id }, isUsed: false },
      { isUsed: true }
    );

    const token = JWTUtil.generateEmailVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const verification = this.emailVerificationRepository.create({
      user: user,
      email: user.email,
      token,
      expiresAt,
    });

    await this.emailVerificationRepository.save(verification);

    // Send email
    await this.emailService.sendEmailVerification(user, token);

    logger.info(`Email verification sent to: ${user.email}`);
  }

  async verifyEmail(token: string): Promise<User> {
    const verification = await this.emailVerificationRepository.findOne({
      where: { token },
      relations: ['user']
    });

    if (!verification || !verification.isValid()) {
      throw new Error('Invalid or expired verification token');
    }

    // Mark verification as used
    verification.markAsUsed();
    await this.emailVerificationRepository.save(verification);

    // Update user
    const user = verification.user;
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.status = UserStatus.ACTIVE;

    await this.userRepository.save(user);

    logger.info(`Email verified for user: ${user.email}`);
    return user;
  }

  async sendPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Don't reveal if email exists for security
      logger.warn(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    // Invalidate existing password resets
    await this.passwordResetRepository.update(
      { user: { id: user.id }, isUsed: false },
      { isUsed: true }
    );

    const token = JWTUtil.generatePasswordResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const passwordReset = this.passwordResetRepository.create({
      user: user,
      email: user.email,
      token,
      expiresAt,
    });

    await this.passwordResetRepository.save(passwordReset);

    // Send email
    await this.emailService.sendPasswordReset(user, token);

    logger.info(`Password reset sent to: ${user.email}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<User> {
    const passwordReset = await this.passwordResetRepository.findOne({
      where: { token },
      relations: ['user']
    });

    if (!passwordReset || !passwordReset.isValid()) {
      throw new Error('Invalid or expired reset token');
    }

    // Mark reset as used
    passwordReset.markAsUsed();
    await this.passwordResetRepository.save(passwordReset);

    // Update user password
    const user = passwordReset.user;
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    user.resetFailedAttempts(); // Clear any lockouts

    await this.userRepository.save(user);

    // Revoke all existing sessions for security
    await this.revokeAllUserSessions(user.id, 'Password reset');

    logger.info(`Password reset for user: ${user.email}`);
    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await this.userRepository.save(user);

    logger.info(`Password changed for user: ${user.email}`);
  }

  async revokeAllUserSessions(userId: string, reason?: string): Promise<void> {
    await this.sessionRepository.update(
      { user: { id: userId }, isActive: true },
      {
        isActive: false,
        revokedAt: new Date(),
        revokeReason: reason || 'All sessions revoked'
      }
    );

    logger.info(`All sessions revoked for user: ${userId}`);
  }

  private async createSession(
    user: User,
    tokens: TokenPair,
    loginData: LoginData
  ): Promise<UserSession> {
    const session = this.sessionRepository.create({
      user: user,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: JWTUtil.getTokenExpirationDate(process.env.JWT_EXPIRES_IN || '7d'),
      refreshExpiresAt: JWTUtil.getTokenExpirationDate(process.env.JWT_REFRESH_EXPIRES_IN || '30d'),
      ipAddress: loginData.ipAddress,
      userAgent: loginData.userAgent,
    });

    return await this.sessionRepository.save(session);
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    return await this.sessionRepository.find({
      where: { user: { id: userId }, isActive: true },
      order: { lastUsedAt: 'DESC' }
    });
  }

  async revokeSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, user: { id: userId } }
    });

    if (session) {
      session.revoke(userId, 'Manual revocation');
      await this.sessionRepository.save(session);
    }
  }
}