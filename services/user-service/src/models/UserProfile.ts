import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name', length: 100, nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', length: 100, nullable: true })
  lastName?: string;

  @Column({ name: 'display_name', length: 200, nullable: true })
  displayName?: string;

  @Column('text', { nullable: true })
  bio?: string;

  @Column({ length: 100, nullable: true })
  title?: string;

  @Column({ length: 200, nullable: true })
  company?: string;

  @Column({ length: 100, nullable: true })
  location?: string;

  @Column({ length: 100, nullable: true })
  website?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'date', nullable: true })
  birthday?: Date;

  @Column({ length: 10, nullable: true })
  gender?: string;

  @Column({ length: 100, nullable: true })
  timezone?: string;

  // Social links
  @Column('jsonb', { name: 'social_links', default: '{}' })
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    facebook?: string;
    instagram?: string;
    medium?: string;
    personal_website?: string;
  };

  // Professional information
  @Column('text', { array: true, default: '{}' })
  skills: string[];

  @Column('text', { array: true, default: '{}' })
  interests: string[];

  @Column('text', { array: true, default: '{}' })
  industries: string[];

  @Column({ name: 'years_of_experience', nullable: true })
  yearsOfExperience?: number;

  @Column({ name: 'investment_range_min', type: 'bigint', nullable: true })
  investmentRangeMin?: number;

  @Column({ name: 'investment_range_max', type: 'bigint', nullable: true })
  investmentRangeMax?: number;

  @Column('text', { array: true, default: '{}' })
  @Index()
  tags: string[];

  // Contact preferences
  @Column('jsonb', { name: 'contact_preferences', default: '{}' })
  contactPreferences: {
    allowMessages?: boolean;
    allowInvestorContact?: boolean;
    allowRecruiterContact?: boolean;
    preferredContactMethod?: 'email' | 'phone' | 'linkedin';
  };

  // Profile completion and visibility
  @Column({ name: 'profile_completion_percentage', default: 0 })
  profileCompletionPercentage: number;

  @Column({ name: 'is_public', default: true })
  isPublic: boolean;

  @Column({ name: 'is_searchable', default: true })
  isSearchable: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  // Virtual getters
  get fullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.displayName || this.firstName || this.lastName || 'Anonymous';
  }

  get initials(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
    }
    if (this.displayName) {
      const parts = this.displayName.split(' ');
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      }
      return this.displayName.charAt(0).toUpperCase();
    }
    return 'A';
  }

  get isProfileComplete(): boolean {
    return this.profileCompletionPercentage >= 80;
  }

  // Calculate profile completion percentage
  calculateCompletionPercentage(): number {
    const fields = ['firstName', 'lastName', 'bio', 'title', 'location', 'skills', 'interests'];

    let completed = 0;
    const total = fields.length;

    fields.forEach((field) => {
      const value = this[field as keyof this];
      if (value) {
        if (Array.isArray(value) && value.length > 0) {
          completed++;
        } else if (typeof value === 'string' && value.trim().length > 0) {
          completed++;
        }
      }
    });

    this.profileCompletionPercentage = Math.round((completed / total) * 100);
    return this.profileCompletionPercentage;
  }
}
