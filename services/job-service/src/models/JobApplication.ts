import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { Job } from './Job';

export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  SHORTLISTED = 'shortlisted',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  INTERVIEWED = 'interviewed',
  OFFER_EXTENDED = 'offer_extended',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

@Entity('job_applications')
@Index(['jobId'])
@Index(['applicantId'])
@Index(['status'])
@Index(['createdAt'])
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'job_id' })
  jobId: string;

  @Column({ name: 'applicant_id' })
  applicantId: string; // User ID of the applicant

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.SUBMITTED
  })
  status: ApplicationStatus;

  // Application content
  @Column('text', { name: 'cover_letter', nullable: true })
  coverLetter?: string;

  @Column({ name: 'resume_url', nullable: true })
  resumeUrl?: string;

  @Column({ name: 'portfolio_url', nullable: true })
  portfolioUrl?: string;

  @Column({ name: 'linkedin_url', nullable: true })
  linkedinUrl?: string;

  @Column({ name: 'github_url', nullable: true })
  githubUrl?: string;

  @Column({ name: 'website_url', nullable: true })
  websiteUrl?: string;

  // Contact information
  @Column({ name: 'phone_number', nullable: true })
  phoneNumber?: string;

  @Column({ name: 'email_address' })
  emailAddress: string;

  @Column({ name: 'full_name' })
  fullName: string;

  // Experience and expectations
  @Column({ name: 'years_of_experience', nullable: true })
  yearsOfExperience?: number;

  @Column({ name: 'current_company', nullable: true })
  currentCompany?: string;

  @Column({ name: 'current_title', nullable: true })
  currentTitle?: string;

  @Column({ name: 'salary_expectation', type: 'integer', nullable: true })
  salaryExpectation?: number;

  @Column({ name: 'notice_period_days', nullable: true })
  noticePeriodDays?: number;

  @Column({ name: 'available_start_date', nullable: true })
  availableStartDate?: Date;

  @Column({ name: 'requires_visa_sponsorship', default: false })
  requiresVisaSponsorship: boolean;

  @Column({ name: 'willing_to_relocate', default: false })
  willingToRelocate: boolean;

  // Custom questions responses
  @Column('jsonb', { name: 'custom_responses', default: '{}' })
  customResponses: Record<string, any>;

  // Application tracking
  @Column({ name: 'source', default: 'direct' })
  source: string; // How they found the job (direct, linkedin, etc.)

  @Column({ name: 'referrer_id', nullable: true })
  referrerId?: string; // User ID of referrer if applicable

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;

  // Status tracking
  @Column({ name: 'reviewed_at', nullable: true })
  reviewedAt?: Date;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy?: string; // User ID of reviewer

  @Column({ name: 'interview_scheduled_at', nullable: true })
  interviewScheduledAt?: Date;

  @Column({ name: 'interview_notes', nullable: true })
  interviewNotes?: string;

  @Column({ name: 'rejection_reason', nullable: true })
  rejectionReason?: string;

  @Column({ name: 'feedback', nullable: true })
  feedback?: string;

  // Communication tracking
  @Column({ name: 'last_contacted_at', nullable: true })
  lastContactedAt?: Date;

  @Column({ name: 'contact_count', default: 0 })
  contactCount: number;

  // Rating and scoring
  @Column({ name: 'resume_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  resumeScore?: number;

  @Column({ name: 'culture_fit_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  cultureFitScore?: number;

  @Column({ name: 'technical_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  technicalScore?: number;

  @Column({ name: 'overall_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  overallScore?: number;

  // Metadata
  @Column('jsonb', { name: 'metadata', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Job, job => job.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  // Virtual getters
  get isActive(): boolean {
    return ![
      ApplicationStatus.ACCEPTED,
      ApplicationStatus.REJECTED,
      ApplicationStatus.WITHDRAWN
    ].includes(this.status);
  }

  get isPending(): boolean {
    return [
      ApplicationStatus.SUBMITTED,
      ApplicationStatus.UNDER_REVIEW
    ].includes(this.status);
  }

  get isInProgress(): boolean {
    return [
      ApplicationStatus.SHORTLISTED,
      ApplicationStatus.INTERVIEW_SCHEDULED,
      ApplicationStatus.INTERVIEWED,
      ApplicationStatus.OFFER_EXTENDED
    ].includes(this.status);
  }

  get isFinal(): boolean {
    return [
      ApplicationStatus.ACCEPTED,
      ApplicationStatus.REJECTED,
      ApplicationStatus.WITHDRAWN
    ].includes(this.status);
  }

  get statusDisplayName(): string {
    const statusNames = {
      [ApplicationStatus.SUBMITTED]: 'Submitted',
      [ApplicationStatus.UNDER_REVIEW]: 'Under Review',
      [ApplicationStatus.SHORTLISTED]: 'Shortlisted',
      [ApplicationStatus.INTERVIEW_SCHEDULED]: 'Interview Scheduled',
      [ApplicationStatus.INTERVIEWED]: 'Interviewed',
      [ApplicationStatus.OFFER_EXTENDED]: 'Offer Extended',
      [ApplicationStatus.ACCEPTED]: 'Accepted',
      [ApplicationStatus.REJECTED]: 'Rejected',
      [ApplicationStatus.WITHDRAWN]: 'Withdrawn',
    };
    return statusNames[this.status];
  }

  // Methods
  updateStatus(newStatus: ApplicationStatus, updatedBy?: string, notes?: string): void {
    this.status = newStatus;
    this.reviewedAt = new Date();
    this.reviewedBy = updatedBy;

    if (notes) {
      if (newStatus === ApplicationStatus.REJECTED) {
        this.rejectionReason = notes;
      } else if (newStatus === ApplicationStatus.INTERVIEWED) {
        this.interviewNotes = notes;
      } else {
        this.feedback = notes;
      }
    }
  }

  scheduleInterview(scheduledAt: Date): void {
    this.status = ApplicationStatus.INTERVIEW_SCHEDULED;
    this.interviewScheduledAt = scheduledAt;
  }

  recordContact(): void {
    this.lastContactedAt = new Date();
    this.contactCount += 1;
  }

  calculateOverallScore(): number {
    const scores = [this.resumeScore, this.cultureFitScore, this.technicalScore].filter(score => score !== null && score !== undefined);

    if (scores.length === 0) return 0;

    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    this.overallScore = Math.round(average * 100) / 100;

    return this.overallScore;
  }

  canWithdraw(): boolean {
    return this.isActive;
  }

  canBeUpdated(): boolean {
    return this.status === ApplicationStatus.SUBMITTED;
  }
}