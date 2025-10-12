import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('startup_claims')
@Index(['startup_id'])
@Index(['user_id'])
@Index(['status'])
export class StartupClaim {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'startup_id' })
  @Index()
  startupId!: string;

  @Column({ name: 'user_id' })
  @Index()
  userId!: string;

  @Column()
  email!: string;

  @Column({ name: 'verification_token' })
  verificationToken!: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  })
  @Index()
  status!: 'pending' | 'approved' | 'rejected';

  @Column('text', { array: true, nullable: true, name: 'proof_documents' })
  proofDocuments?: string[];

  @Column('text', { nullable: true, name: 'admin_notes' })
  adminNotes?: string;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt!: Date;

  @Column({ name: 'reviewed_at', nullable: true })
  reviewedAt?: Date;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy?: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
