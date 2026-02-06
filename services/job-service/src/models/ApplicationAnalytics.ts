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
import { JobApplication } from './JobApplication';

@Entity('application_analytics')
export class ApplicationAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_id' })
  applicationId: string;

  @Column({ name: 'job_id' })
  @Index()
  jobId: string;

  @Column({ name: 'applicant_id' })
  @Index()
  applicantId: string;

  @Column({ name: 'startup_id' })
  startupId: string;

  // Application metrics
  @Column({ name: 'submission_time_ms', default: 0 })
  submissionTimeMs: number; // How long form took to fill

  @Column({ name: 'pages_scrolled', type: 'decimal', precision: 3, scale: 2, default: 0 })
  pagesScrolled: number; // Percentage of job posting viewed

  @Column({ name: 'time_to_decision_hours', nullable: true })
  timeToDecisionHours?: number; // Hours from submission to first decision

  @Column({ name: 'interactions_count', default: 0 })
  interactionsCount: number; // Total interactions (messages, etc.)

  // View events
  @Column({ name: 'viewed_at', nullable: true })
  viewedAt?: Date;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number; // How many times recruiter viewed

  @Column({
    name: 'avg_view_duration_seconds',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  avgViewDurationSeconds: number;

  // Status timing
  @Column({ name: 'days_to_first_response', nullable: true })
  daysToFirstResponse?: number;

  @Column({ name: 'days_in_review', nullable: true })
  daysInReview?: number;

  @Column({ name: 'days_to_interview', nullable: true })
  daysToInterview?: number;

  @Column({ name: 'days_to_decision', nullable: true })
  daysToDecision?: number;

  // Scoring
  @Column({ name: 'match_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  matchScore?: number; // Job-candidate match (0-100)

  @Column({ name: 'quality_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  qualityScore?: number; // Application quality (0-100)

  // Engagement
  @Column({ name: 'contacted_count', default: 0 })
  contactedCount: number;

  @Column({ name: 'response_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  responseRate?: number; // Messages responded to / sent

  @Column({ name: 'last_interaction_at', nullable: true })
  lastInteractionAt?: Date;

  // Hiring funnel position
  @Column({ name: 'funnel_stage' })
  funnelStage: string; // applied, reviewed, shortlisted, interviewed, offered, hired, rejected

  @Column({ name: 'funnel_drop_reason', nullable: true })
  funnelDropReason?: string;

  // Competitiveness
  @Column({ name: 'applicant_rank', nullable: true })
  applicantRank?: number; // Ranking among all applicants for this job

  @Column({ name: 'total_applicants_at_submission', nullable: true })
  totalApplicantsAtSubmission?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => JobApplication, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: JobApplication;

  // Methods
  calculateTimeMetrics(submittedAt: Date, statusChangeDate?: Date): void {
    if (statusChangeDate) {
      const diffMs = statusChangeDate.getTime() - submittedAt.getTime();
      this.timeToDecisionHours = Math.floor(diffMs / (1000 * 60 * 60));
      this.daysToDecision = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }
  }

  updateFunnelStage(stage: string, reason?: string): void {
    this.funnelStage = stage;
    if (reason) {
      this.funnelDropReason = reason;
    }
  }

  recordView(durationSeconds: number): void {
    this.viewCount++;
    this.avgViewDurationSeconds =
      (parseFloat(this.avgViewDurationSeconds.toString()) * (this.viewCount - 1) +
        durationSeconds) /
      this.viewCount;
    this.viewedAt = new Date();
  }
}
