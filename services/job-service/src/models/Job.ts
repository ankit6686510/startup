import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { JobType, WorkLocation, ExperienceLevel, JobCategory } from '@startup-platform/types';
import { JobApplication } from './JobApplication';
import { SavedJob } from './SavedJob';

@Entity('jobs')
@Index(['type', 'locationType'])
@Index(['category', 'experienceLevel'])
@Index(['isActive', 'expiresAt'])
@Index(['locationCountry', 'locationCity'])
@Index(['salaryMin', 'salaryMax'])
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'startup_id' })
  @Index()
  startupId: string;

  @Column({ name: 'posted_by' })
  @Index()
  postedBy: string; // User ID who posted the job

  @Column({ length: 200 })
  @Index()
  title: string;

  @Column({ length: 300, unique: true })
  @Index()
  slug: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  requirements?: string;

  @Column('text', { nullable: true })
  responsibilities?: string;

  @Column('text', { nullable: true })
  benefits?: string;

  @Column({
    type: 'enum',
    enum: JobType,
  })
  @Index()
  type: JobType;

  @Column({
    type: 'enum',
    enum: WorkLocation,
    name: 'location_type',
  })
  @Index()
  locationType: WorkLocation;

  @Column({
    type: 'enum',
    enum: ExperienceLevel,
    name: 'experience_level',
  })
  @Index()
  experienceLevel: ExperienceLevel;

  @Column({
    type: 'enum',
    enum: JobCategory,
  })
  @Index()
  category: JobCategory;

  // Location fields
  @Column({ name: 'location_country', nullable: true })
  @Index()
  locationCountry?: string;

  @Column({ name: 'location_country_code', length: 2, nullable: true })
  locationCountryCode?: string;

  @Column({ name: 'location_city', nullable: true })
  @Index()
  locationCity?: string;

  @Column({ name: 'location_state', nullable: true })
  locationState?: string;

  @Column({ name: 'location_address', nullable: true })
  locationAddress?: string;

  @Column({ name: 'is_remote_allowed', default: false })
  isRemoteAllowed: boolean;

  // Salary information
  @Column({ name: 'salary_min', type: 'integer', nullable: true })
  @Index()
  salaryMin?: number;

  @Column({ name: 'salary_max', type: 'integer', nullable: true })
  @Index()
  salaryMax?: number;

  @Column({ name: 'salary_currency', length: 3, default: 'USD' })
  salaryCurrency: string;

  @Column({ name: 'salary_equity_min', type: 'decimal', precision: 5, scale: 2, nullable: true })
  salaryEquityMin?: number;

  @Column({ name: 'salary_equity_max', type: 'decimal', precision: 5, scale: 2, nullable: true })
  salaryEquityMax?: number;

  @Column({ name: 'salary_is_disclosed', default: false })
  salaryIsDisclosed: boolean;

  // Job details
  @Column('text', { array: true, default: '{}' })
  skills: string[];

  @Column('text', { array: true, default: '{}' })
  tags: string[];

  @Column({ name: 'years_experience_min', nullable: true })
  yearsExperienceMin?: number;

  @Column({ name: 'years_experience_max', nullable: true })
  yearsExperienceMax?: number;

  @Column({ name: 'education_level', nullable: true })
  educationLevel?: string;

  // Application details
  @Column({ name: 'how_to_apply', nullable: true })
  howToApply?: string;

  @Column({ name: 'external_url', nullable: true })
  externalUrl?: string;

  @Column({ name: 'application_email', nullable: true })
  applicationEmail?: string;

  @Column({ name: 'application_deadline', nullable: true })
  applicationDeadline?: Date;

  // Job status and metadata
  @Column({ name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @Column({ name: 'is_featured', default: false })
  @Index()
  isFeatured: boolean;

  @Column({ name: 'is_urgent', default: false })
  isUrgent: boolean;

  @Column({ name: 'expires_at', nullable: true })
  @Index()
  expiresAt?: Date;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'application_count', default: 0 })
  applicationCount: number;

  @Column({ name: 'last_application_at', nullable: true })
  lastApplicationAt?: Date;

  // Source tracking
  @Column({ name: 'source', default: 'internal' })
  source: string;

  @Column({ name: 'source_job_id', nullable: true })
  sourceJobId?: string;

  // Company branding
  @Column({ name: 'company_logo_url', nullable: true })
  companyLogoUrl?: string;

  @Column({ name: 'company_website', nullable: true })
  companyWebsite?: string;

  // Contact information
  @Column('jsonb', { name: 'contact_info', default: '{}' })
  contactInfo: {
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
  };

  // Additional metadata
  @Column('jsonb', { name: 'metadata', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => JobApplication, (application) => application.job)
  applications: JobApplication[];

  @OneToMany(() => SavedJob, (savedJob) => savedJob.job)
  savedJobs: SavedJob[];

  // Virtual getters
  get isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  get location(): string {
    if (this.locationType === WorkLocation.REMOTE) {
      return 'Remote';
    }

    const parts = [];
    if (this.locationCity) parts.push(this.locationCity);
    if (this.locationState) parts.push(this.locationState);
    if (this.locationCountry) parts.push(this.locationCountry);

    return parts.join(', ') || 'Not specified';
  }

  get salaryRange(): string {
    if (!this.salaryIsDisclosed || (!this.salaryMin && !this.salaryMax)) {
      return 'Not disclosed';
    }

    const formatSalary = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: this.salaryCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    if (this.salaryMin && this.salaryMax) {
      return `${formatSalary(this.salaryMin)} - ${formatSalary(this.salaryMax)}`;
    } else if (this.salaryMin) {
      return `From ${formatSalary(this.salaryMin)}`;
    } else if (this.salaryMax) {
      return `Up to ${formatSalary(this.salaryMax)}`;
    }

    return 'Not disclosed';
  }

  get equityRange(): string {
    if (!this.salaryEquityMin && !this.salaryEquityMax) {
      return 'Not specified';
    }

    if (this.salaryEquityMin && this.salaryEquityMax) {
      return `${this.salaryEquityMin}% - ${this.salaryEquityMax}%`;
    } else if (this.salaryEquityMin) {
      return `From ${this.salaryEquityMin}%`;
    } else if (this.salaryEquityMax) {
      return `Up to ${this.salaryEquityMax}%`;
    }

    return 'Not specified';
  }

  // Methods
  incrementViewCount(): void {
    this.viewCount += 1;
  }

  incrementApplicationCount(): void {
    this.applicationCount += 1;
    this.lastApplicationAt = new Date();
  }

  isApplicationOpen(): boolean {
    if (!this.isActive || this.isExpired) return false;
    if (this.applicationDeadline && new Date() > this.applicationDeadline) return false;
    return true;
  }

  canUserApply(): boolean {
    return this.isApplicationOpen();
  }
}
