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

@Entity('job_analytics')
@Index(['jobId', 'date'])
export class JobAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'job_id' })
  @Index()
  jobId: string;

  @Column({ type: 'date' })
  @Index()
  date: Date;

  // View metrics
  @Column({ name: 'total_views', default: 0 })
  totalViews: number;

  @Column({ name: 'unique_views', default: 0 })
  uniqueViews: number;

  @Column({ name: 'authenticated_views', default: 0 })
  authenticatedViews: number;

  @Column({ name: 'anonymous_views', default: 0 })
  anonymousViews: number;

  // Application metrics
  @Column({ name: 'total_applications', default: 0 })
  totalApplications: number;

  @Column({ name: 'applications_submitted', default: 0 })
  applicationsSubmitted: number;

  @Column({ name: 'applications_shortlisted', default: 0 })
  applicationsShortlisted: number;

  @Column({ name: 'applications_rejected', default: 0 })
  applicationsRejected: number;

  // Engagement metrics
  @Column({ name: 'avg_time_spent_seconds', type: 'decimal', precision: 10, scale: 2, default: 0 })
  avgTimeSpentSeconds: number;

  @Column({ name: 'save_count', default: 0 })
  saveCount: number;

  @Column({ name: 'share_count', default: 0 })
  shareCount: number;

  @Column({ name: 'apply_clicks', default: 0 })
  applyClicks: number;

  @Column({ name: 'conversion_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  conversionRate: number; // (applications / views) * 100

  // Traffic sources
  @Column('jsonb', { name: 'traffic_sources', default: '{}' })
  trafficSources: {
    direct?: number;
    organic?: number;
    social?: number;
    referral?: number;
    email?: number;
    paid?: number;
  };

  @Column('jsonb', { name: 'utm_sources', default: '{}' })
  utmSources: Record<string, number>; // { "linkedin": 50, "twitter": 30 }

  // Device breakdown
  @Column('jsonb', { name: 'device_breakdown', default: '{}' })
  deviceBreakdown: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };

  // Geographic data
  @Column('jsonb', { name: 'top_countries', default: '[]' })
  topCountries: Array<{ country: string; count: number }>;

  @Column('jsonb', { name: 'top_cities', default: '[]' })
  topCities: Array<{ city: string; count: number }>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  // Methods
  incrementView(isAuthenticated: boolean = false): void {
    this.totalViews++;
    if (isAuthenticated) {
      this.authenticatedViews++;
    } else {
      this.anonymousViews++;
    }
  }

  incrementApplication(): void {
    this.totalApplications++;
    this.applicationsSubmitted++;
    this.updateConversionRate();
  }

  incrementSave(): void {
    this.saveCount++;
  }

  incrementShare(): void {
    this.shareCount++;
  }

  incrementApplyClick(): void {
    this.applyClicks++;
  }

  updateConversionRate(): void {
    if (this.totalViews > 0) {
      this.conversionRate = (this.totalApplications / this.totalViews) * 100;
    }
  }

  addTrafficSource(source: string): void {
    if (!this.trafficSources) {
      this.trafficSources = {};
    }
    const key = source.toLowerCase() as keyof typeof this.trafficSources;
    this.trafficSources[key] = (this.trafficSources[key] || 0) + 1;
  }

  addDevice(deviceType: string): void {
    if (!this.deviceBreakdown) {
      this.deviceBreakdown = {};
    }
    const key = deviceType.toLowerCase() as keyof typeof this.deviceBreakdown;
    this.deviceBreakdown[key] = (this.deviceBreakdown[key] || 0) + 1;
  }
}
