# Application Management System - Architecture & Integration Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Applications                   │
│  (Web Frontend, Mobile App, Third-party Services)           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (Port 3000)                   │
│              Request Routing & Validation                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│            Job Service (Port 3003) - NEW ENDPOINTS          │
├─────────────────────────────────────────────────────────────┤
│  Request Layer (Enhanced Application Controller)             │
│  ├─ Document Management Endpoints (3)                        │
│  ├─ Status Management Endpoints (3)                          │
│  ├─ Bulk Operations Endpoints (3)                            │
│  └─ Analytics Endpoints (3)                                  │
├─────────────────────────────────────────────────────────────┤
│  Service Layer (ApplicationManagementService)                │
│  ├─ Document Upload/Management                              │
│  ├─ Status Tracking & Notifications                          │
│  ├─ Bulk Operations                                          │
│  └─ Analytics Calculations                                   │
├─────────────────────────────────────────────────────────────┤
│  Data Layer (TypeORM Models & Repositories)                  │
│  ├─ ApplicationDocument                                      │
│  ├─ ApplicationStatusHistory                                 │
│  └─ ApplicationAnalytics                                     │
└──────────────┬──────────────────┬──────────────────────────┘
               │                  │
               ↓                  ↓
        ┌────────────────┐  ┌──────────────────┐
        │  PostgreSQL DB │  │  S3 / CloudFlare │
        │                │  │  (File Storage)  │
        │  Tables:       │  │                  │
        │  ├─ Documents  │  │  Resume PDFs     │
        │  ├─ Status     │  │  Cover Letters   │
        │  │   History   │  │  Portfolios      │
        │  └─ Analytics  │  └──────────────────┘
        └────────────────┘
               ↑
               │
        ┌──────────────────────┐
        │ Notification Service │
        │   (Port 3005)        │
        │                      │
        │ Sends:               │
        │ ├─ Status emails     │
        │ ├─ Offer letters     │
        │ └─ Interview alerts  │
        └──────────────────────┘
```

## Request Flow Example: Upload Resume

```
1. User Action (Frontend)
   ↓
   POST /api/v1/applications/:applicationId/documents
   Headers: {
     "x-user-id": "user-uuid",
     "Content-Type": "multipart/form-data"
   }
   Body: {
     file: <binary_pdf>,
     documentType: "resume",
     isPrimary: true
   }

2. Routing Layer
   ↓
   Request → application.routes.ts
   → upload.single('file') middleware
   → ApplicationController.uploadDocumentValidation
   → Validates input

3. Controller Layer
   ↓
   EnhancedApplicationController.uploadDocument()
   → Validates request
   → Calls service

4. Service Layer
   ↓
   ApplicationManagementService.uploadApplicationDocument()
   → Generate storage key
   → Upload to S3
   → Create document record
   → Update application

5. Data Layer
   ↓
   TypeORM Repository.save(document)
   → INSERT INTO application_documents
   ↓
   PostgreSQL

6. Response
   ↓
   201 Created
   {
     "success": true,
     "data": {
       "document": {
         "id": "doc-uuid",
         "fileUrl": "https://s3.../documents/...",
         "isPrimary": true
       }
     }
   }
```

## Request Flow Example: Update Status with Notifications

```
1. User Action (Recruiter)
   ↓
   PATCH /api/v1/applications/:applicationId/status
   Headers: { "x-user-id": "recruiter-uuid" }
   Body: {
     "status": "SHORTLISTED",
     "reason": "Strong technical skills"
   }

2. Controller
   ↓
   EnhancedApplicationController.updateApplicationStatus()

3. Service - Multiple Operations
   ┌──────────────────────────────────────────┐
   │ ApplicationManagementService              │
   │                                          │
   │ A. updateApplicationStatus()             │
   │    ├─ Update application.status          │
   │    ├─ Create status history record       │
   │    └─ Update analytics                   │
   │                                          │
   │ B. triggerStatusNotification()           │
   │    └─ Send to notification service       │
   │                                          │
   │ C. updateApplicationAnalytics()          │
   │    └─ Update funnel stage metrics        │
   └──────────────────────────────────────────┘

4. Data Operations (Parallel)
   ├─ UPDATE applications SET status='SHORTLISTED'
   ├─ INSERT INTO application_status_history (...)
   └─ UPDATE application_analytics SET funnel_stage='shortlisted'

5. Integration Calls
   ├─ HTTP POST to Notification Service
   │  {
   │    "type": "APPLICATION_STATUS_CHANGE",
   │    "status": "SHORTLISTED",
   │    "message": "Congratulations! You've been shortlisted"
   │  }
   │
   └─ Notification Service sends email/SMS/push

6. Response
   ├─ 200 OK
   └─ {
       "success": true,
       "data": {
         "application": { "status": "SHORTLISTED" },
         "history": { "id": "history-uuid" }
       }
     }
```

## Endpoint Organization

```
Application Management Routes
├── /api/v1/applications/
│
├── Document Management
│   ├── POST   /:applicationId/documents
│   │          Upload resume/document
│   │
│   ├── GET    /:applicationId/documents
│   │          Retrieve all documents
│   │
│   └── DELETE /:applicationId/documents/:documentId
│              Delete document
│
├── Status Management
│   ├── PATCH  /:applicationId/status
│   │          Update status with history
│   │
│   ├── GET    /:applicationId/history
│   │          Get status change history
│   │
│   └── GET    /:applicationId/timeline
│              Combined timeline
│
├── Bulk Operations
│   ├── POST   /bulk/apply
│   │          Apply to multiple jobs
│   │
│   ├── PATCH  /bulk/status
│   │          Update multiple statuses
│   │
│   └── GET    /
│              Search with filters/pagination
│
└── Analytics
    ├── GET    /:applicationId/analytics
    │          Single application metrics
    │
    ├── GET    /analytics/pipeline
    │          Recruiting pipeline analysis
    │
    └── GET    /analytics/quality
               Application quality metrics
```

## Database Relationships

```
JobApplication (existing)
├── id: UUID
├── jobId: UUID → Job
├── applicantId: UUID → User
├── status: enum
├── createdAt: timestamp
└── ...

    ↓ One-to-Many

ApplicationDocument
├── id: UUID
├── applicationId: UUID → JobApplication
├── documentType: enum (resume, cover_letter, portfolio, other)
├── fileUrl: string (S3 URL)
├── isPrimary: boolean
├── metadata: JSONB
└── createdAt: timestamp

    ↓ One-to-Many

ApplicationStatusHistory
├── id: UUID
├── applicationId: UUID → JobApplication
├── status: enum
├── previousStatus: enum
├── changedBy: UUID → User
├── changeReason: string
├── notes: string
└── createdAt: timestamp (Index)

    ↓ One-to-One

ApplicationAnalytics
├── id: UUID
├── applicationId: UUID → JobApplication (Unique)
├── jobId: UUID → Job (Index)
├── startupId: UUID (Index)
├── funnelStage: enum
├── submissionTimeMs: integer
├── matchScore: numeric
├── qualityScore: numeric
├── competitivenessRank: integer
└── createdAt: timestamp
```

## Data Flow for Analytics

```
Application Submitted
↓
Create ApplicationAnalytics Record
├─ funnelStage = "applied"
├─ submissionTimeMs = 180000
├─ viewCount = 0
├─ matchScore = null (to be calculated)
└─ createdAt = now

User Actions (Document Upload, Status Changes)
↓
Update ApplicationAnalytics
├─ viewCount++
├─ daysInReview = (currentDate - reviewedAt)
├─ matchScore = calculate(application_data, job_requirements)
└─ qualityScore = calculate(resume_quality, cover_letter_quality)

Decision Made
↓
Update ApplicationAnalytics
├─ daysToDecision = (currentDate - submittedAt)
├─ funnelStage = "hired" or "rejected"
├─ funnelDropReason = rejection_reason
└─ competitivenessRank = rank_among_applicants_for_job

Query Pipeline Analytics
↓
Aggregate ApplicationAnalytics Records
├─ Count by funnelStage
├─ Calculate conversionRates
├─ Average timings
└─ Identify dropoff reasons
```

## Error Handling Flow

```
Request
↓
Validation Layer
├─ MIME type check → ValidationError
├─ File size check → ValidationError
├─ Required fields → ValidationError
└─ Status enum → ValidationError
    ↓ If Valid
    ↓
Service Layer
├─ Application exists? → NotFoundError
├─ User authorized? → UnauthorizedError
├─ Status transition valid? → ConflictError
└─ S3 upload fails? → ApplicationError
    ↓ If Success
    ↓
Response 200/201
    ↓ If Error
    ↓
Error Handler Middleware
├─ Log error
├─ Format response
└─ Send 4xx/5xx
```

## Security & Access Control

```
Request
↓
Authentication Middleware
├─ Check x-user-id header
└─ Return 401 if missing

Authorization Check (Service Level)
├─ Applicant
│  ├─ Can view own applications
│  ├─ Can upload own documents
│  ├─ Can view own status
│  └─ Cannot change status
│
├─ Recruiter
│  ├─ Can view applications for their startup's jobs
│  ├─ Can change application status
│  ├─ Can view analytics
│  ├─ Can bulk update
│  └─ Cannot see other startups' applications
│
└─ Admin
   ├─ Full access to all
   ├─ Can view all applications
   ├─ Can override status changes
   └─ Can access system analytics

File Upload Security
├─ MIME type whitelist
├─ File size limit
├─ S3 private bucket
├─ Signed URLs for access
└─ Auto-cleanup on rejection
```

## Integration with External Services

### 1. Notification Service Integration
```typescript
// When status changes:
POST http://notification-service:3005/api/v1/notifications
{
  "applicationId": "app-uuid",
  "type": "APPLICATION_STATUS_CHANGE",
  "status": "SHORTLISTED",
  "message": "Congratulations! You've been shortlisted",
  "metadata": {
    "previousStatus": "UNDER_REVIEW",
    "changedBy": "recruiter-uuid",
    "changedAt": "2024-01-15T10:45:00Z"
  }
}
```

### 2. File Storage Integration (S3)
```typescript
// Upload:
const params = {
  Bucket: 'startup-applications',
  Key: 'applications/{applicationId}/{documentType}/{timestamp}.pdf',
  Body: fileBuffer,
  ContentType: 'application/pdf',
  ACL: 'private'
};
const result = await s3Client.send(new PutObjectCommand(params));

// Delete:
await s3Client.send(new DeleteObjectCommand({
  Bucket: 'startup-applications',
  Key: storageKey
}));

// Access:
const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
  expiresIn: 3600 // 1 hour
});
```

### 3. User Service Integration
```typescript
// Get user details:
GET http://user-service:3002/api/v1/users/:userId
// Used for notifications and access control

// Verify applicant:
GET http://user-service:3002/api/v1/users/:applicantId
// Confirm user exists before creating application
```

## Deployment Topology

```
Production Environment
├── Load Balancer
│   └─ api.startup.com
│
├── API Gateway (Docker Container)
│   ├─ Port 3000
│   ├─ Environment: prod
│   └─ Replicas: 3
│
├── Job Service (Docker Container)
│   ├─ Port 3003
│   ├─ Environment variables:
│   │  ├─ S3_BUCKET=startup-applications-prod
│   │  ├─ DB_HOST=postgres-prod.internal
│   │  └─ NOTIFICATION_SERVICE_URL=http://notification-service-prod:3005
│   ├─ Mount S3 credentials
│   └─ Replicas: 2
│
├── PostgreSQL Database
│   ├─ Host: postgres-prod.internal
│   ├─ Port: 5432
│   ├─ Tables: 
│   │  ├─ application_documents
│   │  ├─ application_status_history
│   │  └─ application_analytics
│   ├─ Backups: Daily snapshots
│   └─ Replication: Primary + 2 replicas
│
├── S3/CloudFlare R2
│   ├─ Bucket: startup-applications-prod
│   ├─ Region: us-east-1
│   ├─ Versioning: Enabled
│   ├─ Lifecycle: Delete after 90 days if rejected
│   └─ Encryption: Server-side encryption
│
└── Notification Service (Docker Container)
    ├─ Port 3005
    ├─ Email: SendGrid
    ├─ SMS: Twilio
    └─ Push: Firebase
```

## Monitoring & Observability

```
Application Metrics
├─ Document Upload Success Rate
├─ Status Update Latency
├─ Bulk Operation Throughput
└─ Analytics Query Performance

Database Metrics
├─ Query Performance
├─ Index Hit Ratio
├─ Table Size Growth
└─ Replication Lag

File Storage Metrics
├─ Upload Success Rate
├─ Average File Size
├─ Storage Usage
└─ Download Latency

Integration Metrics
├─ Notification Service Response Time
├─ S3 API Latency
├─ Error Rates
└─ Retry Attempts

Application Logs
├─ Request logging (request ID, user, endpoint, duration)
├─ Error logging (stack trace, context)
├─ Audit logging (who did what, when, why)
└─ Debug logging (conditional based on environment)
```

## Performance Tuning

```
Database Query Optimization
├─ Indexes:
│  ├─ application_documents(application_id)
│  ├─ application_status_history(application_id, created_at DESC)
│  ├─ application_analytics(startup_id, job_id, funnel_stage)
│  └─ job_applications(status, created_at DESC)
│
├─ Query Patterns:
│  ├─ Use pagination (max 100 per page)
│  ├─ Select specific columns
│  ├─ Lazy load relations
│  └─ Use COUNT() for aggregations
│
└─ Connection Pool:
   ├─ Min: 5 connections
   ├─ Max: 20 connections
   └─ Idle timeout: 30 seconds

Cache Strategy
├─ Analytics (1 hour TTL)
├─ Pipeline metrics (1 hour TTL)
├─ Quality metrics (1 hour TTL)
└─ Facet counts (5 minute TTL)

File Upload Optimization
├─ Multipart upload for large files
├─ Compression before upload
├─ Async processing for metadata extraction
└─ CDN distribution for downloads
```

## Troubleshooting Decision Tree

```
Issue: Document upload fails
├─ Check file size (< 10MB?)
├─ Check MIME type (PDF, DOC, DOCX, JPG, PNG?)
├─ Check S3 credentials
├─ Check S3 bucket permissions
└─ Check disk space

Issue: Status update not sending notification
├─ Verify notification service is running
├─ Check network connectivity
├─ Check notification service logs
├─ Verify user contact info
└─ Check notification service queue

Issue: Analytics queries slow
├─ Check if indexes exist
├─ Analyze query plan (EXPLAIN)
├─ Check table row count
├─ Add query cache
└─ Schedule background aggregation

Issue: Bulk operations failing
├─ Check individual item validation
├─ Review job ID validity
├─ Check database connection pool
├─ Monitor application logs
└─ Retry with smaller batch size
```

This architecture provides a scalable, secure, and maintainable system for managing job applications with complete audit trails and rich analytics capabilities.

