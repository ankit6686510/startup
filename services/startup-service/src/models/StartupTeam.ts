import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Startup } from './Startup';

export enum TeamRole {
  FOUNDER = 'FOUNDER',
  CO_FOUNDER = 'CO_FOUNDER',
  CEO = 'CEO',
  CTO = 'CTO',
  CFO = 'CFO',
  COO = 'COO',
  VP_ENGINEERING = 'VP_ENGINEERING',
  VP_PRODUCT = 'VP_PRODUCT',
  VP_SALES = 'VP_SALES',
  VP_MARKETING = 'VP_MARKETING',
  HEAD_OF_OPERATIONS = 'HEAD_OF_OPERATIONS',
  PRODUCT_MANAGER = 'PRODUCT_MANAGER',
  ENGINEER = 'ENGINEER',
  DESIGNER = 'DESIGNER',
  MARKETING = 'MARKETING',
  SALES = 'SALES',
  OPERATIONS = 'OPERATIONS',
  OTHER = 'OTHER',
}

@Entity('startup_team')
@Index('idx_startup_team_startup_id', ['startupId'])
@Index('idx_startup_team_order', ['orderIndex'])
export class StartupTeam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'startup_id' })
  startupId: string;

  @Column('varchar', { length: 200 })
  name: string;

  @Column('varchar', { name: 'title', length: 100 })
  title: string;

  @Column('varchar', { name: 'role' })
  role: TeamRole;

  @Column('text', { nullable: true })
  bio: string;

  @Column('varchar', { name: 'email', nullable: true })
  email: string;

  @Column('varchar', { name: 'phone', nullable: true })
  phone: string;

  @Column('varchar', { name: 'profile_image_url', nullable: true })
  profileImageUrl: string; // S3 URL

  @Column('varchar', { name: 'linkedin_url', nullable: true })
  linkedinUrl: string;

  @Column('varchar', { name: 'twitter_url', nullable: true })
  twitterUrl: string;

  @Column('varchar', { name: 'github_url', nullable: true })
  githubUrl: string;

  @Column('varchar', { name: 'personal_website', nullable: true })
  personalWebsite: string;

  @Column('text', { name: 'background', nullable: true })
  background: string; // Work experience summary

  @Column('simple-array', { name: 'expertise', nullable: true })
  expertise: string[]; // Array of skills

  @Column('simple-array', { name: 'education', nullable: true })
  education: string[]; // Array of education entries

  @Column('boolean', { name: 'is_featured', default: false })
  isFeatured: boolean; // Show prominently on profile

  @Column('integer', { name: 'order_index', default: 0 })
  orderIndex: number; // For ordering team members

  @Column('integer', { name: 'views_count', default: 0 })
  viewsCount: number;

  @Column('jsonb', { name: 'custom_fields', default: '{}' })
  customFields: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Startup, (startup) => startup.teamMembers, {
    onDelete: 'CASCADE',
  })
  startup: Startup;

  // Methods
  incrementViewCount(): void {
    this.viewsCount = (this.viewsCount || 0) + 1;
  }
}
