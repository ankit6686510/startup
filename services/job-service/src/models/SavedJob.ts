import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique
} from 'typeorm';
import { Job } from './Job';

@Entity('saved_jobs')
@Index(['jobId'])
@Index(['createdAt'])
@Unique(['userId', 'jobId'])
export class SavedJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'job_id' })
  jobId: string;

  @Column('text', { nullable: true })
  notes?: string;

  @Column('text', { array: true, default: '{}' })
  tags: string[];

  @Column({ name: 'is_applied', default: false })
  isApplied: boolean;

  @Column({ name: 'applied_at', nullable: true })
  appliedAt?: Date;

  @Column({ name: 'reminder_set', default: false })
  reminderSet: boolean;

  @Column({ name: 'reminder_date', nullable: true })
  reminderDate?: Date;

  @Column({ name: 'priority', default: 'medium' })
  priority: 'low' | 'medium' | 'high' | 'urgent';

  @Column('jsonb', { name: 'metadata', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  // Methods
  markAsApplied(): void {
    this.isApplied = true;
    this.appliedAt = new Date();
  }

  setReminder(date: Date): void {
    this.reminderSet = true;
    this.reminderDate = date;
  }

  clearReminder(): void {
    this.reminderSet = false;
    this.reminderDate = undefined;
  }

  updatePriority(priority: 'low' | 'medium' | 'high' | 'urgent'): void {
    this.priority = priority;
  }

  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
  }

  get isReminderDue(): boolean {
    if (!this.reminderSet || !this.reminderDate) return false;
    return new Date() >= this.reminderDate;
  }

  get daysSaved(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}