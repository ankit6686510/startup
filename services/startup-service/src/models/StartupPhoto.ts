import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Startup } from './Startup';

export enum PhotoCategory {
  OFFICE = 'OFFICE',
  TEAM = 'TEAM',
  PRODUCT = 'PRODUCT',
  EVENT = 'EVENT',
  CULTURE = 'CULTURE',
  ACHIEVEMENT = 'ACHIEVEMENT',
  OTHER = 'OTHER',
}

@Entity('startup_photos')
@Index('idx_startup_photos_startup_id', ['startupId'])
@Index('idx_startup_photos_category', ['category'])
@Index('idx_startup_photos_order', ['orderIndex'])
export class StartupPhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'startup_id' })
  startupId: string;

  @Column('varchar', { length: 500 })
  title: string;

  @Column('text', { nullable: true })
  caption: string;

  @Column('varchar')
  category: PhotoCategory;

  @Column('varchar', { name: 'image_url' })
  imageUrl: string; // S3 URL

  @Column('varchar', { name: 'thumbnail_url', nullable: true })
  thumbnailUrl: string; // S3 URL - optimized thumbnail

  @Column('varchar', { name: 'alt_text', nullable: true })
  altText: string; // For accessibility

  @Column('integer', { name: 'width', nullable: true })
  width: number; // Image dimensions

  @Column('integer', { name: 'height', nullable: true })
  height: number;

  @Column('varchar', { name: 'mime_type', nullable: true })
  mimeType: string; // image/jpeg, image/png, etc.

  @Column('integer', { name: 'file_size', nullable: true })
  fileSize: number; // In bytes

  @Column('integer', { name: 'order_index', default: 0 })
  orderIndex: number; // For ordering photos

  @Column('boolean', { name: 'is_featured', default: false })
  isFeatured: boolean; // Show on main profile

  @Column('integer', { name: 'views_count', default: 0 })
  viewsCount: number;

  @Column('integer', { name: 'likes_count', default: 0 })
  likesCount: number;

  @Column('uuid', { name: 'uploaded_by', nullable: true })
  uploadedBy: string; // User ID

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column('timestamp', { name: 'deleted_at', nullable: true })
  deletedAt: Date;

  // Relations
  @ManyToOne(() => Startup, (startup) => startup.photos, {
    onDelete: 'CASCADE',
  })
  startup: Startup;

  // Methods
  incrementViewCount(): void {
    this.viewsCount = (this.viewsCount || 0) + 1;
  }

  incrementLikesCount(): void {
    this.likesCount = (this.likesCount || 0) + 1;
  }

  decrementLikesCount(): void {
    this.likesCount = Math.max(0, (this.likesCount || 0) - 1);
  }
}
