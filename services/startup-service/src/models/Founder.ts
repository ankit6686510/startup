import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Startup } from './Startup';

@Entity('founders')
@Index(['startupId'])
export class Founder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'startup_id' })
  startupId!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 100 })
  title!: string;

  @Column('text', { nullable: true })
  bio?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ name: 'linkedin_url', nullable: true })
  linkedinUrl?: string;

  @Column({ name: 'twitter_url', nullable: true })
  twitterUrl?: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl?: string;

  @Column({ name: 'is_primary', default: false })
  isPrimary!: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  equity?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Startup, startup => startup.founders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'startup_id' })
  startup!: Startup;
}
