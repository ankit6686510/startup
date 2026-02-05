import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';
import {
  JobType,
  WorkLocation,
  ExperienceLevel,
  JobCategory
} from '@startup-platform/types';

@Entity('job_alerts')
export class JobAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ length: 200 })
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  // Search criteria
  @Column('text', { array: true, default: '{}' })
  keywords: string[];

  @Column('text', { array: true, default: '{}' })
  @Index()
  locations: string[];

  @Column('text', { array: true, default: '{}' })
  companies: string[];

  @Column({
    type: 'enum',
    enum: JobType,
    array: true,
    default: '{}'
  })
  jobTypes: JobType[];

  @Column({
    type: 'enum',
    enum: WorkLocation,
    array: true,
    default: '{}'
  })
  locationTypes: WorkLocation[];

  @Column({
    type: 'enum',
    enum: ExperienceLevel,
    array: true,
    default: '{}'
  })
  experienceLevels: ExperienceLevel[];

  @Column({
    type: 'enum',
    enum: JobCategory,
    array: true,
    default: '{}'
  })
  categories: JobCategory[];

  @Column('text', { array: true, default: '{}' })
  skills: string[];

  @Column('text', { array: true, default: '{}' })
  industries: string[];

  // Salary filters
  @Column({ name: 'salary_min', type: 'integer', nullable: true })
  salaryMin?: number;

  @Column({ name: 'salary_max', type: 'integer', nullable: true })
  salaryMax?: number;

  @Column({ name: 'salary_currency', length: 3, default: 'USD' })
  salaryCurrency: string;

  @Column({ name: 'equity_min', type: 'decimal', precision: 5, scale: 2, nullable: true })
  equityMin?: number;

  @Column({ name: 'equity_max', type: 'decimal', precision: 5, scale: 2, nullable: true })
  equityMax?: number;

  // Experience filters
  @Column({ name: 'years_experience_min', nullable: true })
  yearsExperienceMin?: number;

  @Column({ name: 'years_experience_max', nullable: true })
  yearsExperienceMax?: number;

  // Job preferences
  @Column({ name: 'remote_only', default: false })
  remoteOnly: boolean;

  @Column({ name: 'featured_only', default: false })
  featuredOnly: boolean;

  @Column({ name: 'exclude_applied_jobs', default: true })
  excludeAppliedJobs: boolean;

  // Notification settings
  @Column({ name: 'frequency', default: 'daily' })
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';

  @Column({ name: 'max_jobs_per_alert', default: 10 })
  maxJobsPerAlert: number;

  @Column({ name: 'notification_email', default: true })
  notificationEmail: boolean;

  @Column({ name: 'notification_push', default: false })
  notificationPush: boolean;

  // Status and tracking
  @Column({ name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @Column({ name: 'jobs_sent_count', default: 0 })
  jobsSentCount: number;

  @Column({ name: 'last_sent_at', nullable: true })
  @Index()
  lastSentAt?: Date;

  @Column({ name: 'last_job_count', default: 0 })
  lastJobCount: number;

  @Column({ name: 'total_matches_found', default: 0 })
  totalMatchesFound: number;

  @Column({ name: 'clicks_count', default: 0 })
  clicksCount: number;

  @Column({ name: 'applications_from_alert', default: 0 })
  applicationsFromAlert: number;

  // Advanced filters
  @Column('jsonb', { name: 'advanced_filters', default: '{}' })
  advancedFilters: {
    companySize?: string[];
    fundingStage?: string[];
    benefits?: string[];
    techStack?: string[];
    workVisa?: boolean;
    securityClearance?: boolean;
    customFields?: Record<string, any>;
  };

  @Column('jsonb', { name: 'metadata', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual getters
  get isReadyToSend(): boolean {
    if (!this.isActive) return false;
    if (!this.lastSentAt) return true;

    const now = new Date();
    const lastSent = new Date(this.lastSentAt);
    const diffHours = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);

    switch (this.frequency) {
      case 'immediate':
        return diffHours >= 1; // At least 1 hour between immediate alerts
      case 'daily':
        return diffHours >= 24;
      case 'weekly':
        return diffHours >= 168; // 7 * 24
      case 'monthly':
        return diffHours >= 720; // 30 * 24
      default:
        return false;
    }
  }

  get searchCriteriaString(): string {
    const criteria = [];

    if (this.keywords.length > 0) {
      criteria.push(`Keywords: ${this.keywords.join(', ')}`);
    }

    if (this.locations.length > 0) {
      criteria.push(`Locations: ${this.locations.join(', ')}`);
    }

    if (this.categories.length > 0) {
      criteria.push(`Categories: ${this.categories.join(', ')}`);
    }

    if (this.jobTypes.length > 0) {
      criteria.push(`Types: ${this.jobTypes.join(', ')}`);
    }

    if (this.salaryMin || this.salaryMax) {
      const salaryRange = [];
      if (this.salaryMin) salaryRange.push(`${this.salaryMin}+`);
      if (this.salaryMax) salaryRange.push(`up to ${this.salaryMax}`);
      criteria.push(`Salary: ${salaryRange.join(' - ')} ${this.salaryCurrency}`);
    }

    return criteria.join(' | ') || 'All jobs';
  }

  // Methods
  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  updateLastSent(jobCount: number): void {
    this.lastSentAt = new Date();
    this.lastJobCount = jobCount;
    this.jobsSentCount += jobCount;
    this.totalMatchesFound += jobCount;
  }

  recordClick(): void {
    this.clicksCount += 1;
  }

  recordApplication(): void {
    this.applicationsFromAlert += 1;
  }

  updateFrequency(frequency: 'immediate' | 'daily' | 'weekly' | 'monthly'): void {
    this.frequency = frequency;
  }

  addKeyword(keyword: string): void {
    if (!this.keywords.includes(keyword.toLowerCase())) {
      this.keywords.push(keyword.toLowerCase());
    }
  }

  removeKeyword(keyword: string): void {
    this.keywords = this.keywords.filter(k => k !== keyword.toLowerCase());
  }

  addLocation(location: string): void {
    if (!this.locations.includes(location)) {
      this.locations.push(location);
    }
  }

  removeLocation(location: string): void {
    this.locations = this.locations.filter(l => l !== location);
  }

  addSkill(skill: string): void {
    if (!this.skills.includes(skill.toLowerCase())) {
      this.skills.push(skill.toLowerCase());
    }
  }

  removeSkill(skill: string): void {
    this.skills = this.skills.filter(s => s !== skill.toLowerCase());
  }

  getClickThroughRate(): number {
    if (this.jobsSentCount === 0) return 0;
    return (this.clicksCount / this.jobsSentCount) * 100;
  }

  getApplicationRate(): number {
    if (this.clicksCount === 0) return 0;
    return (this.applicationsFromAlert / this.clicksCount) * 100;
  }

  hasKeywordMatch(jobTitle: string, jobDescription: string): boolean {
    if (this.keywords.length === 0) return true;

    const content = `${jobTitle} ${jobDescription}`.toLowerCase();
    return this.keywords.some(keyword => content.includes(keyword.toLowerCase()));
  }

  hasLocationMatch(jobLocation: string): boolean {
    if (this.locations.length === 0) return true;
    if (this.remoteOnly) return true; // Remote jobs match any location preference

    return this.locations.some(location =>
      jobLocation.toLowerCase().includes(location.toLowerCase())
    );
  }

  hasSkillMatch(jobSkills: string[]): boolean {
    if (this.skills.length === 0) return true;

    const jobSkillsLower = jobSkills.map(skill => skill.toLowerCase());
    return this.skills.some(skill =>
      jobSkillsLower.some(jobSkill => jobSkill.includes(skill))
    );
  }
}