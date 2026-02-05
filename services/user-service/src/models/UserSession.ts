import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';

@Entity('user_sessions')
@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500, unique: true })
  @Index()
  token: string;

  @Column({ name: 'refresh_token', length: 500, nullable: true })
  refreshToken?: string;

  @Column({ name: 'expires_at' })
  @Index()
  expiresAt: Date;

  @Column({ name: 'refresh_expires_at', nullable: true })
  refreshExpiresAt?: Date;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;

  @Column({ name: 'device_type', nullable: true })
  deviceType?: string;

  @Column({ name: 'browser', nullable: true })
  browser?: string;

  @Column({ name: 'os', nullable: true })
  os?: string;

  @Column({ name: 'country', nullable: true })
  country?: string;

  @Column({ name: 'city', nullable: true })
  city?: string;

  @Column({ name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @Column({ name: 'last_used_at', nullable: true })
  lastUsedAt?: Date;

  @Column({ name: 'revoked_at', nullable: true })
  revokedAt?: Date;

  @Column({ name: 'revoked_by', nullable: true })
  revokedBy?: string;

  @Column({ name: 'revoke_reason', nullable: true })
  revokeReason?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  // Methods
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isRefreshExpired(): boolean {
    if (!this.refreshExpiresAt) return true;
    return new Date() > this.refreshExpiresAt;
  }

  isValid(): boolean {
    return this.isActive && !this.isExpired() && !this.revokedAt;
  }

  revoke(revokedBy?: string, reason?: string): void {
    this.isActive = false;
    this.revokedAt = new Date();
    this.revokedBy = revokedBy;
    this.revokeReason = reason;
  }

  updateLastUsed(): void {
    this.lastUsedAt = new Date();
  }

  // Get device info summary
  get deviceInfo(): string {
    const parts = [];
    if (this.browser) parts.push(this.browser);
    if (this.os) parts.push(this.os);
    if (this.deviceType) parts.push(this.deviceType);
    return parts.join(' • ') || 'Unknown Device';
  }

  // Get location summary
  get locationInfo(): string {
    const parts = [];
    if (this.city) parts.push(this.city);
    if (this.country) parts.push(this.country);
    return parts.join(', ') || 'Unknown Location';
  }
}
