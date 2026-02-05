import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { UserRole, UserStatus } from '@startup-platform/types';
import bcrypt from 'bcryptjs';
import { UserProfile } from './UserProfile';
import { UserSession } from './UserSession';
import { EmailVerification } from './EmailVerification';
import { PasswordReset } from './PasswordReset';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, unique: true })
  @Index()
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  @Index()
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION
  })
  @Index()
  status: UserStatus;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'email_verified_at', nullable: true })
  emailVerifiedAt?: Date;

  @Column({ name: 'last_login_at', nullable: true })
  @Index()
  lastLoginAt?: Date;

  @Column({ name: 'last_login_ip', nullable: true })
  lastLoginIp?: string;

  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', nullable: true })
  lockedUntil?: Date;

  @Column({ name: 'password_changed_at', nullable: true })
  passwordChangedAt?: Date;

  @Column({ name: 'two_factor_enabled', default: false })
  twoFactorEnabled: boolean;

  @Column({ name: 'two_factor_secret', nullable: true })
  twoFactorSecret?: string;

  // OAuth fields
  @Column({ name: 'google_id', nullable: true })
  googleId?: string;

  @Column({ name: 'linkedin_id', nullable: true })
  linkedinId?: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  // Preferences
  @Column('jsonb', { name: 'preferences', default: '{}' })
  preferences: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      marketing?: boolean;
    };
    privacy?: {
      profileVisible?: boolean;
      showEmail?: boolean;
    };
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
  };

  // Metadata
  @Column('jsonb', { name: 'metadata', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => UserProfile, profile => profile.user, { cascade: true })
  profile: UserProfile;

  @OneToMany(() => UserSession, session => session.user)
  sessions: UserSession[];

  @OneToMany(() => EmailVerification, verification => verification.user)
  emailVerifications: EmailVerification[];

  @OneToMany(() => PasswordReset, passwordReset => passwordReset.user)
  passwordResets: PasswordReset[];

  // Methods
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  isLocked(): boolean {
    return this.lockedUntil ? this.lockedUntil > new Date() : false;
  }

  incrementFailedAttempts(): void {
    this.failedLoginAttempts += 1;

    // Lock account after 5 failed attempts for 30 minutes
    if (this.failedLoginAttempts >= 5) {
      this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
  }

  resetFailedAttempts(): void {
    this.failedLoginAttempts = 0;
    this.lockedUntil = undefined;
  }

  updateLastLogin(ip?: string): void {
    this.lastLoginAt = new Date();
    this.lastLoginIp = ip;
    this.resetFailedAttempts();
  }

  // Virtual getters
  get isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  get isVerified(): boolean {
    return this.emailVerified;
  }

  get isFounder(): boolean {
    return this.role === UserRole.FOUNDER;
  }

  get isInvestor(): boolean {
    return this.role === UserRole.INVESTOR;
  }

  get isAdmin(): boolean {
    return [UserRole.ADMIN, UserRole.MODERATOR].includes(this.role);
  }

  // Sanitized user data for API responses
  toJSON() {
    const { password, twoFactorSecret, ...publicUser } = this;
    return publicUser;
  }
}