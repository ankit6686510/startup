# Application Management Implementation Guide

## Overview

This guide covers the implementation details, integration points, and deployment considerations for the Application Management system.

## Architecture

### Service Layer (`ApplicationManagementService`)

The `ApplicationManagementService` provides the core business logic for application management:

```
Request → Controller → Service → Repository → Database
                        ↓
                    Models & Entities
```

**Key Methods:**

1. **Document Management**
   - `uploadApplicationDocument()` - Store document metadata and files
   - `getApplicationDocuments()` - Retrieve all documents
   - `deleteApplicationDocument()` - Remove document

2. **Status Tracking**
   - `updateApplicationStatus()` - Change status with history
   - `getApplicationStatusHistory()` - Retrieve status changes
   - `getApplicationTimeline()` - Combined view of all events

3. **Bulk Operations**
   - `bulkApplyToJobs()` - Apply to multiple jobs
   - `bulkUpdateStatus()` - Update multiple applications
   - `getApplicationsByFilter()` - Advanced filtering with pagination

4. **Analytics**
   - `getApplicationAnalytics()` - Single application metrics
   - `getPipelineAnalytics()` - Recruiting funnel analysis
   - `getQualityMetrics()` - Application quality assessment

### Database Models

#### 1. ApplicationDocument
```typescript
@Entity('application_documents')
export class ApplicationDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_id' })
  applicationId: string;

  @Column('text')
  documentType: string; // resume, cover_letter, portfolio, other

  @Column('varchar', { length: 255 })
  fileName: string;

  @Column('integer')
  fileSize: number;

  @Column('varchar', { length: 100 })
  fileMimeType: string;

  @Column('varchar')
  fileUrl: string; // S3 URL

  @Column('varchar')
  storageKey: string; // For deletion

  @Column('boolean', { default: false })
  isPrimary: boolean;

  @Column('uuid')
  uploadedBy: string;

  @Column('jsonb', { default: '{}' })
  metadata: {
    pages?: number;
    isTextExtracted?: boolean;
    extractedText?: string;
    uploadedVia?: 'web' | 'mobile' | 'api';
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Index()
  @ManyToOne(() => JobApplication)
  application: JobApplication;
}
```

#### 2. ApplicationStatusHistory
```typescript
@Entity('application_status_history')
export class ApplicationStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  applicationId: string;

  @Column('varchar')
  status: ApplicationStatus;

  @Column('varchar', { nullable: true })
  previousStatus: ApplicationStatus;

  @Column('uuid', { nullable: true })
  changedBy: string; // User ID who changed the status

  @Column('text', { nullable: true })
  changeReason: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column('jsonb', { default: '{}' })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @Index()
  @ManyToOne(() => JobApplication, { onDelete: 'CASCADE' })
  application: JobApplication;
}
```

#### 3. ApplicationAnalytics
```typescript
@Entity('application_analytics')
export class ApplicationAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  applicationId: string;

  @Column('uuid')
  jobId: string;

  @Column('uuid')
  applicantId: string;

  @Column('uuid')
  startupId: string;

  // Funnel tracking
  @Column('varchar')
  funnelStage: 'applied' | 'reviewed' | 'shortlisted' | 'interviewed' | 'offered' | 'hired' | 'rejected';

  @Column('varchar', { nullable: true })
  funnelDropReason: string;

  // Timing metrics
  @Column('integer')
  submissionTimeMs: number;

  @Column('integer', { default: 0 })
  viewCount: number;

  @Column('integer', { nullable: true })
  daysInReview: number;

  @Column('integer', { nullable: true })
  daysToDecision: number;

  // Scoring
  @Column('numeric', { precision: 5, scale: 2, nullable: true })
  matchScore: number; // 0-100

  @Column('numeric', { precision: 5, scale: 2, nullable: true })
  qualityScore: number; // 0-100

  // Competitiveness
  @Column('integer', { nullable: true })
  competitivenessRank: number;

  @Column('integer', { default: 0 })
  totalApplicantsForJob: number;

  // Response tracking
  @Column('timestamp', { nullable: true })
  respondedAt: Date;

  @Column('numeric', { precision: 5, scale: 2, default: 0 })
  responseRate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Index(['applicationId'])
  @Index(['jobId'])
  @Index(['startupId'])
  @ManyToOne(() => JobApplication, { onDelete: 'CASCADE' })
  application: JobApplication;
}
```

## Integration Points

### 1. Notification Service Integration

When application status changes, trigger notifications:

```typescript
// In ApplicationManagementService.updateApplicationStatus()

private async triggerStatusNotification(
  applicationId: string,
  newStatus: ApplicationStatus,
  previousStatus: ApplicationStatus
): Promise<void> {
  // Send to notification service
  await fetch('http://notification-service:3005/api/v1/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      applicationId,
      type: 'APPLICATION_STATUS_CHANGE',
      status: newStatus,
      previousStatus,
      message: this.getStatusMessage(newStatus)
    })
  });
}
```

### 2. File Storage Integration (S3/CloudFlare R2)

Implement file upload handler:

```typescript
// AWS SDK example
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

private async uploadToStorage(
  file: UploadedFile,
  storageKey: string
): Promise<string> {
  const s3Client = new S3Client({ region: process.env.AWS_REGION });
  
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: storageKey,
    Body: file.buffer,
    ContentType: file.mimetype
  });

  await s3Client.send(command);
  
  return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${storageKey}`;
}

private async deleteFromStorage(storageKey: string): Promise<void> {
  const s3Client = new S3Client({ region: process.env.AWS_REGION });
  
  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: storageKey
  });

  await s3Client.send(command);
}
```

### 3. Authentication Middleware

```typescript
// middleware/auth.ts
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userId = req.headers['x-user-id'];
  
  if (!userId) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  req.user = { id: userId as string };
  next();
};
```

### 4. Error Handler Middleware

```typescript
// middleware/errorHandler.ts
export const errorHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

## Setup Instructions

### 1. Database Setup

```sql
-- Create tables
CREATE TABLE application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL,
  document_type VARCHAR NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  file_mime_type VARCHAR(100),
  file_url VARCHAR NOT NULL,
  storage_key VARCHAR NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  uploaded_by UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_application_documents_application_id 
  ON application_documents(application_id);

CREATE TABLE application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL,
  status VARCHAR NOT NULL,
  previous_status VARCHAR,
  changed_by UUID,
  change_reason TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_application_status_history_application_id 
  ON application_status_history(application_id);
CREATE INDEX idx_application_status_history_status 
  ON application_status_history(status);

CREATE TABLE application_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL UNIQUE,
  job_id UUID NOT NULL,
  applicant_id UUID NOT NULL,
  startup_id UUID NOT NULL,
  funnel_stage VARCHAR NOT NULL,
  funnel_drop_reason VARCHAR,
  submission_time_ms INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  days_in_review INTEGER,
  days_to_decision INTEGER,
  match_score NUMERIC(5,2),
  quality_score NUMERIC(5,2),
  competitiveness_rank INTEGER,
  total_applicants_for_job INTEGER DEFAULT 0,
  responded_at TIMESTAMP,
  response_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_application_analytics_application_id 
  ON application_analytics(application_id);
CREATE INDEX idx_application_analytics_job_id 
  ON application_analytics(job_id);
CREATE INDEX idx_application_analytics_startup_id 
  ON application_analytics(startup_id);
CREATE INDEX idx_application_analytics_funnel_stage 
  ON application_analytics(funnel_stage);
```

### 2. Environment Variables

```env
# Storage
S3_BUCKET=startup-applications
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxxx
AWS_SECRET_ACCESS_KEY=xxxx

# Or CloudFlare R2
CLOUDFLARE_ACCOUNT_ID=xxxx
CLOUDFLARE_ACCESS_KEY_ID=xxxx
CLOUDFLARE_SECRET_ACCESS_KEY=xxxx

# Notification Service
NOTIFICATION_SERVICE_URL=http://notification-service:3005

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_DOCUMENT_TYPES=pdf,doc,docx,jpg,png
```

### 3. Dependency Installation

```bash
# Add multer for file uploads
npm install multer
npm install --save-dev @types/multer

# Add AWS SDK for S3
npm install @aws-sdk/client-s3

# Or CloudFlare R2
npm install wrangler
```

### 4. Docker Configuration

Add to `docker-compose.yml`:

```yaml
job-service:
  environment:
    S3_BUCKET: ${S3_BUCKET}
    S3_REGION: ${S3_REGION}
    NOTIFICATION_SERVICE_URL: http://notification-service:3005
```

## Testing

### Unit Tests Example

```typescript
// src/services/__tests__/ApplicationManagementService.test.ts
import { ApplicationManagementService } from '@/services/ApplicationManagementService';
import { AppDataSource } from '@/config/database';

describe('ApplicationManagementService', () => {
  let service: ApplicationManagementService;

  beforeAll(async () => {
    await AppDataSource.initialize();
    service = new ApplicationManagementService();
  });

  describe('Document Upload', () => {
    it('should upload a resume document', async () => {
      const file = {
        originalName: 'resume.pdf',
        mimetype: 'application/pdf',
        size: 104857,
        buffer: Buffer.from('PDF content')
      };

      const document = await service.uploadApplicationDocument(
        'app-uuid',
        'resume',
        file,
        true
      );

      expect(document.fileName).toBe('resume.pdf');
      expect(document.isPrimary).toBe(true);
    });
  });

  describe('Status Update', () => {
    it('should update status and create history', async () => {
      const result = await service.updateApplicationStatus(
        'app-uuid',
        'SHORTLISTED',
        'recruiter-uuid',
        'Strong candidate'
      );

      expect(result.application.status).toBe('SHORTLISTED');
      expect(result.history.changeReason).toBe('Strong candidate');
    });
  });

  describe('Bulk Operations', () => {
    it('should apply to multiple jobs', async () => {
      const result = await service.bulkApplyToJobs({
        jobIds: ['job-1', 'job-2'],
        applicantId: 'user-uuid',
        commonData: {
          emailAddress: 'test@example.com',
          fullName: 'Test User'
        }
      });

      expect(result.successful.length).toBeGreaterThan(0);
    });
  });

  describe('Analytics', () => {
    it('should retrieve pipeline analytics', async () => {
      const analytics = await service.getPipelineAnalytics('startup-uuid');

      expect(analytics).toHaveProperty('funnelStages');
      expect(analytics).toHaveProperty('conversionRates');
      expect(analytics).toHaveProperty('timings');
    });
  });
});
```

## Performance Optimization

### 1. Database Indexing

Already included in schema:
- `application_documents.application_id`
- `application_status_history.application_id`
- `application_analytics.application_id, job_id, startup_id`

### 2. Query Optimization

```typescript
// Use select to limit columns
const applications = await this.applicationRepository.find({
  select: ['id', 'jobId', 'status', 'createdAt'],
  where: { status: 'SHORTLISTED' }
});

// Use pagination
const page = 1;
const limit = 50;
const [results, total] = await this.applicationRepository.findAndCount({
  skip: (page - 1) * limit,
  take: limit
});
```

### 3. Caching Strategy

```typescript
// Cache pipeline analytics (updated hourly)
const cacheKey = `pipeline_analytics_${startupId}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const analytics = await this.calculatePipelineAnalytics(startupId);
await redis.setex(cacheKey, 3600, JSON.stringify(analytics)); // 1 hour TTL

return analytics;
```

## Monitoring & Logging

### Log Important Events

```typescript
logger.info('Document uploaded', {
  applicationId,
  documentType,
  fileSize,
  timestamp: new Date().toISOString()
});

logger.warn('Large file uploaded', {
  applicationId,
  fileSize: file.size,
  maxAllowed: 10485760
});

logger.error('Upload failed', {
  applicationId,
  reason: error.message,
  timestamp: new Date().toISOString()
});
```

## Security Considerations

1. **File Upload Validation**
   - Validate MIME types
   - Limit file size (10MB)
   - Scan for malware (integrate with ClamAV)
   - Store in private S3 bucket

2. **Access Control**
   - Users can only see own applications
   - Recruiters can see applications for their startup's jobs
   - Admins have full access

3. **Data Privacy**
   - Encrypt sensitive fields (SSN, references)
   - GDPR compliance for EU users
   - Right to be forgotten implementation

## Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] S3/R2 bucket created and configured
- [ ] File upload limits set appropriately
- [ ] Notification service integration tested
- [ ] Authentication middleware enabled
- [ ] Rate limiting configured
- [ ] Monitoring and logging setup
- [ ] Backup strategy in place
- [ ] Security audit completed

## Troubleshooting

### Issue: Files not uploading

**Solution:**
- Check S3 credentials
- Verify bucket permissions
- Check file size limits
- Review MIME type whitelist

### Issue: Status notifications not sending

**Solution:**
- Verify notification service is running
- Check network connectivity
- Review notification service logs
- Verify user contact information

### Issue: Analytics queries slow

**Solution:**
- Check indexes exist
- Add database query cache
- Reduce date range for queries
- Use background jobs for aggregation

