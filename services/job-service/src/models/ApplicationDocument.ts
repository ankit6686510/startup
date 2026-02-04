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

@Entity('application_documents')
@Index(['application_id'])
@Index(['document_type'])
@Index(['created_at'])
export class ApplicationDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_id' })
  @Index()
  applicationId: string;

  @Column({ name: 'document_type' })
  @Index()
  documentType: string; // resume, cover_letter, portfolio, other

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_size' })
  fileSize: number; // in bytes

  @Column({ name: 'file_mime_type' })
  fileMimeType: string; // application/pdf, etc.

  @Column({ name: 'file_url' })
  fileUrl: string; // S3 or storage URL

  @Column({ name: 'storage_key' })
  storageKey: string; // For deleting later

  @Column({ name: 'uploaded_by', nullable: true })
  uploadedBy?: string; // User ID who uploaded

  @Column('jsonb', { name: 'metadata', default: '{}' })
  metadata: {
    pages?: number;
    isTextExtracted?: boolean;
    extractedText?: string;
    uploadedVia?: string; // web, api, etc.
  };

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean; // Main resume/cover letter

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => JobApplication, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: JobApplication;

  // Methods
  markAsPrimary(): void {
    this.isPrimary = true;
  }

  markAsSecondary(): void {
    this.isPrimary = false;
  }
}
