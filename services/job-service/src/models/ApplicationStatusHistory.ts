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
import { JobApplication } from './JobApplication';

export enum ApplicationStatusHistory {
  SUBMITTED = 'submitted',
  VIEWED = 'viewed',
  UNDER_REVIEW = 'under_review',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  INTERVIEWED = 'interviewed',
  OFFER_EXTENDED = 'offer_extended',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  WITHDRAWN = 'withdrawn'
}

@Entity('application_status_history')
@Index(['application_id', 'created_at'])
@Index(['application_id', 'status'])
@Index(['created_at'])
export class ApplicationStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_id' })
  @Index()
  applicationId: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatusHistory
  })
  @Index()
  status: ApplicationStatusHistory;

  @Column({ name: 'previous_status', nullable: true })
  previousStatus?: string;

  @Column({ name: 'changed_by', nullable: true })
  changedBy?: string; // User ID who made the change

  @Column({ name: 'change_reason', nullable: true })
  changeReason?: string;

  @Column('text', { nullable: true })
  notes?: string;

  @Column('jsonb', { name: 'metadata', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => JobApplication, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: JobApplication;
}
