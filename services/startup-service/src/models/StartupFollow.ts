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
import { Startup } from './Startup';

@Entity('startup_follows')
@Index(['userId', 'startupId'], { unique: true })
@Index(['userId', 'followedAt'])
@Index(['startupId', 'followedAt'])
export class StartupFollow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('uuid', { name: 'startup_id' })
  startupId: string;

  @Column('text', { name: 'notification_preferences', default: 'all' })
  notificationPreferences: 'all' | 'major' | 'none'; // Types of notifications to receive

  @Column('boolean', { name: 'is_bookmarked', default: false })
  isBookmarked: boolean; // Also track if bookmarked

  @Column('jsonb', { name: 'metadata', default: '{}' })
  metadata: {
    followedFrom?: string; // Where they discovered and followed from
    tags?: string[]; // User-created tags for organizing follows
    notes?: string; // Personal notes about the startup
    [key: string]: any;
  };

  @CreateDateColumn({ name: 'followed_at' })
  followedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column('timestamp', { name: 'unfollowed_at', nullable: true })
  unfollowedAt: Date | null;

  // Relations
  @ManyToOne(() => Startup, startup => startup.followers, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'startup_id' })
  startup: Startup;

  // Methods
  isActive(): boolean {
    return this.unfollowedAt === null;
  }

  unfollow(): void {
    this.unfollowedAt = new Date();
  }

  refollow(): void {
    this.unfollowedAt = null;
  }

  setNotificationPreference(preference: 'all' | 'major' | 'none'): void {
    this.notificationPreferences = preference;
  }

  addTag(tag: string): void {
    if (!this.metadata.tags) {
      this.metadata.tags = [];
    }
    if (!this.metadata.tags.includes(tag)) {
      this.metadata.tags.push(tag);
    }
  }

  removeTag(tag: string): void {
    if (this.metadata.tags) {
      this.metadata.tags = this.metadata.tags.filter(t => t !== tag);
    }
  }

  addNote(note: string): void {
    this.metadata.notes = note;
  }
}
