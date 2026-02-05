import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Startup } from './Startup';

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum VerificationType {
  DOMAIN_EMAIL = 'DOMAIN_EMAIL', // Company email verification
  OFFICIAL_DOCUMENTS = 'OFFICIAL_DOCUMENTS', // Registration/incorporation docs
  LINKEDIN = 'LINKEDIN', // LinkedIn profile verification
  BANK_ACCOUNT = 'BANK_ACCOUNT', // Bank account verification
  PHONE = 'PHONE', // Phone verification
  MANUAL_REVIEW = 'MANUAL_REVIEW', // Manual admin review
  SOCIAL_PROOF = 'SOCIAL_PROOF', // Multiple social media presence
}

@Entity('startup_verifications')
export class StartupVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'startup_id', unique: true })
  startupId: string;

  @Column('varchar')
  status: VerificationStatus;

  @Column('simple-array', { name: 'verification_types', nullable: true })
  verificationTypes: VerificationType[]; // Methods used to verify

  // Email verification
  @Column('varchar', { name: 'company_email', nullable: true })
  companyEmail: string;

  @Column('varchar', { name: 'company_email_domain', nullable: true })
  companyEmailDomain: string;

  @Column('boolean', { name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column('timestamp', { name: 'email_verified_at', nullable: true })
  emailVerifiedAt: Date;

  // Document verification
  @Column('varchar', { name: 'registration_number', nullable: true })
  registrationNumber: string;

  @Column('varchar', { name: 'registration_document_url', nullable: true })
  registrationDocumentUrl: string; // S3 URL

  @Column('boolean', { name: 'documents_verified', default: false })
  documentsVerified: boolean;

  @Column('timestamp', { name: 'documents_verified_at', nullable: true })
  documentsVerifiedAt: Date;

  // LinkedIn verification
  @Column('varchar', { name: 'linkedin_company_id', nullable: true })
  linkedinCompanyId: string;

  @Column('boolean', { name: 'linkedin_verified', default: false })
  linkedinVerified: boolean;

  // Review metadata
  @Column('uuid', { name: 'reviewed_by', nullable: true })
  reviewedBy: string; // Admin user ID

  @Column('timestamp', { name: 'reviewed_at', nullable: true })
  reviewedAt: Date;

  @Column('text', { name: 'review_notes', nullable: true })
  reviewNotes: string;

  @Column('text', { name: 'rejection_reason', nullable: true })
  rejectionReason: string;

  // Metadata
  @Column('integer', { name: 'rejection_count', default: 0 })
  rejectionCount: number;

  @Column('timestamp', { name: 'last_rejection_at', nullable: true })
  lastRejectionAt: Date;

  @Column('jsonb', { name: 'verification_metadata', default: '{}' })
  verificationMetadata: {
    ipAddress?: string;
    userAgent?: string;
    dnsRecordsVerified?: boolean;
    linkedinFollowers?: number;
    twitterVerified?: boolean;
    [key: string]: any;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => Startup, (startup) => startup.verification, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'startup_id' })
  startup: Startup;

  // Methods
  isFullyVerified(): boolean {
    return this.status === VerificationStatus.VERIFIED;
  }

  hasEmailVerification(): boolean {
    return this.emailVerified;
  }

  hasDocumentVerification(): boolean {
    return this.documentsVerified;
  }

  isPending(): boolean {
    return this.status === VerificationStatus.PENDING;
  }

  isRejected(): boolean {
    return this.status === VerificationStatus.REJECTED;
  }

  recordRejection(reason: string): void {
    this.rejectionCount++;
    this.lastRejectionAt = new Date();
    this.rejectionReason = reason;
    this.status = VerificationStatus.REJECTED;
  }

  canResubmit(): boolean {
    // Can resubmit after 7 days from last rejection
    if (this.lastRejectionAt) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return this.lastRejectionAt < sevenDaysAgo;
    }
    return true;
  }
}
