import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { DataSource } from '@startup-platform/types';
import { Startup } from './Startup';

@Entity('startup_metrics')
@Index(['startupId', 'metricDate'])
export class StartupMetrics {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'startup_id' })
  @Index()
  startupId!: string;

  @Column({ name: 'metric_date', type: 'date' })
  @Index()
  metricDate!: Date;

  @Column({ type: 'bigint', nullable: true })
  revenue?: number;

  @Column({ type: 'bigint', nullable: true })
  users?: number;

  @Column({ name: 'active_users', type: 'bigint', nullable: true })
  activeUsers?: number;

  @Column({ type: 'integer', nullable: true })
  employees?: number;

  @Column({ type: 'bigint', nullable: true })
  valuation?: number;

  @Column({ name: 'burn_rate', type: 'bigint', nullable: true })
  burnRate?: number;

  @Column({ type: 'integer', nullable: true })
  runway?: number;

  @Column({ name: 'growth_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  growthRate?: number;

  @Column({
    name: 'data_source',
    type: 'enum',
    enum: DataSource
  })
  dataSource!: DataSource;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => Startup, startup => startup.metrics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'startup_id' })
  startup!: Startup;
}
