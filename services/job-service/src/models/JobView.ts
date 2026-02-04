import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { Job } from './Job';

@Entity('job_views')
@Index(['job_id', 'created_at'])
@Index(['user_id', 'job_id'])
@Index(['created_at'])
export class JobView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'job_id' })
  @Index()
  jobId: string;

  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId?: string; // Null for anonymous views

  @Column({ name: 'session_id', nullable: true })
  sessionId?: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;

  @Column({ name: 'referrer', nullable: true })
  referrer?: string;

  @Column({ name: 'device_type', nullable: true })
  deviceType?: string; // mobile, tablet, desktop

  @Column({ name: 'browser', nullable: true })
  browser?: string;

  @Column({ name: 'country', nullable: true })
  country?: string;

  @Column({ name: 'city', nullable: true })
  city?: string;

  @Column('jsonb', { name: 'utm_params', default: '{}' })
  utmParams: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };

  @Column({ name: 'time_spent_seconds', default: 0 })
  timeSpentSeconds: number;

  @Column({ name: 'clicked_apply', default: false })
  clickedApply: boolean;

  @Column({ name: 'clicked_save', default: false })
  clickedSave: boolean;

  @Column({ name: 'clicked_share', default: false })
  clickedShare: boolean;

  @Column({ name: 'scrolled_percentage', default: 0 })
  scrolledPercentage: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  // Methods
  updateEngagement(data: {
    timeSpent?: number;
    clickedApply?: boolean;
    clickedSave?: boolean;
    clickedShare?: boolean;
    scrolledPercentage?: number;
  }): void {
    if (data.timeSpent) this.timeSpentSeconds = data.timeSpent;
    if (data.clickedApply !== undefined) this.clickedApply = data.clickedApply;
    if (data.clickedSave !== undefined) this.clickedSave = data.clickedSave;
    if (data.clickedShare !== undefined) this.clickedShare = data.clickedShare;
    if (data.scrolledPercentage !== undefined) this.scrolledPercentage = data.scrolledPercentage;
  }
}
