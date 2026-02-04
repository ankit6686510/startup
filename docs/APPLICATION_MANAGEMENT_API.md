# Application Management API Documentation

## Overview

The Application Management API provides comprehensive functionality for job applications, including resume upload, status tracking, notifications, bulk operations, and detailed analytics.

## Base URL

```
http://localhost:3003/api/v1/applications
```

## Authentication

All endpoints require JWT authentication via `x-user-id` header.

```
x-user-id: <user_id>
```

---

## 1. Document Management

### 1.1 Upload Document/Resume

Upload a resume or document for an application.

**Endpoint:** `POST /:applicationId/documents`

**Request:**
- **Headers:** 
  - `x-user-id: <user_id>`
  - `Content-Type: multipart/form-data`

- **Body:**
  - `file`: Binary file (PDF, DOC, DOCX, JPG, PNG - max 10MB)
  - `documentType`: enum - `resume`, `cover_letter`, `portfolio`, `other`
  - `isPrimary`: boolean (optional) - Mark as primary document

**Example:**
```bash
curl -X POST http://localhost:3003/api/v1/applications/550e8400-e29b-41d4-a716-446655440000/documents \
  -H "x-user-id: user123" \
  -F "file=@resume.pdf" \
  -F "documentType=resume" \
  -F "isPrimary=true"
```

**Response (201):**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "document": {
      "id": "doc-uuid",
      "applicationId": "app-uuid",
      "documentType": "resume",
      "fileName": "resume.pdf",
      "fileUrl": "https://storage.example.com/applications/.../resume.pdf",
      "fileSize": 524288,
      "fileMimeType": "application/pdf",
      "isPrimary": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 1.2 Get Application Documents

Retrieve all documents uploaded for an application.

**Endpoint:** `GET /:applicationId/documents`

**Request:**
- **Headers:** `x-user-id: <user_id>`

**Example:**
```bash
curl http://localhost:3003/api/v1/applications/550e8400-e29b-41d4-a716-446655440000/documents \
  -H "x-user-id: user123"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "doc-uuid",
        "documentType": "resume",
        "fileName": "resume.pdf",
        "fileUrl": "https://storage.example.com/...",
        "isPrimary": true,
        "createdAt": "2024-01-15T10:30:00Z"
      },
      {
        "id": "doc-uuid-2",
        "documentType": "cover_letter",
        "fileName": "cover_letter.pdf",
        "fileUrl": "https://storage.example.com/...",
        "isPrimary": false,
        "createdAt": "2024-01-15T10:35:00Z"
      }
    ]
  },
  "count": 2,
  "timestamp": "2024-01-15T10:35:00Z"
}
```

---

### 1.3 Delete Document

Remove a document from an application.

**Endpoint:** `DELETE /:applicationId/documents/:documentId`

**Request:**
- **Headers:** `x-user-id: <user_id>`

**Example:**
```bash
curl -X DELETE http://localhost:3003/api/v1/applications/550e8400-e29b-41d4-a716-446655440000/documents/doc-uuid \
  -H "x-user-id: user123"
```

**Response (200):**
```json
{
  "success": true,
  "message": "Document deleted successfully",
  "timestamp": "2024-01-15T10:40:00Z"
}
```

---

## 2. Status Management

### 2.1 Update Application Status

Change the status of an application and create history record.

**Endpoint:** `PATCH /:applicationId/status`

**Request:**
- **Headers:** `x-user-id: <user_id>`
- **Body:**
  - `status`: enum - `SUBMITTED`, `VIEWED`, `UNDER_REVIEW`, `SHORTLISTED`, `REJECTED`, `INTERVIEW_SCHEDULED`, `INTERVIEWED`, `OFFER_EXTENDED`, `ACCEPTED`, `DECLINED`, `WITHDRAWN`
  - `reason`: string (optional) - Reason for status change
  - `notes`: string (optional) - Additional notes

**Status Flow:**
```
SUBMITTED → VIEWED → UNDER_REVIEW → SHORTLISTED → INTERVIEW_SCHEDULED 
→ INTERVIEWED → OFFER_EXTENDED → ACCEPTED/DECLINED/WITHDRAWN
                ↓
              REJECTED
```

**Example:**
```bash
curl -X PATCH http://localhost:3003/api/v1/applications/550e8400-e29b-41d4-a716-446655440000/status \
  -H "x-user-id: recruiter123" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHORTLISTED",
    "reason": "Strong technical skills",
    "notes": "Schedule for technical interview"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "data": {
    "application": {
      "id": "app-uuid",
      "status": "SHORTLISTED",
      "reviewedAt": "2024-01-15T10:45:00Z"
    },
    "history": {
      "id": "history-uuid",
      "status": "SHORTLISTED",
      "previousStatus": "UNDER_REVIEW",
      "changedBy": "recruiter123",
      "changeReason": "Strong technical skills",
      "createdAt": "2024-01-15T10:45:00Z"
    }
  },
  "timestamp": "2024-01-15T10:45:00Z"
}
```

---

### 2.2 Get Application Status History

Retrieve all status changes for an application.

**Endpoint:** `GET /:applicationId/history`

**Request:**
- **Headers:** `x-user-id: <user_id>`

**Example:**
```bash
curl http://localhost:3003/api/v1/applications/550e8400-e29b-41d4-a716-446655440000/history \
  -H "x-user-id: user123"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "history-uuid",
        "status": "SHORTLISTED",
        "previousStatus": "UNDER_REVIEW",
        "changedBy": "recruiter123",
        "changeReason": "Strong technical skills",
        "notes": "Schedule for technical interview",
        "createdAt": "2024-01-15T10:45:00Z"
      },
      {
        "id": "history-uuid-2",
        "status": "UNDER_REVIEW",
        "previousStatus": "SUBMITTED",
        "changedBy": "system",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  },
  "count": 2,
  "timestamp": "2024-01-15T10:45:00Z"
}
```

---

### 2.3 Get Application Timeline

Get combined timeline of status changes and document uploads.

**Endpoint:** `GET /:applicationId/timeline`

**Request:**
- **Headers:** `x-user-id: <user_id>`

**Example:**
```bash
curl http://localhost:3003/api/v1/applications/550e8400-e29b-41d4-a716-446655440000/timeline \
  -H "x-user-id: user123"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "timeline": [
      {
        "type": "submission",
        "timestamp": "2024-01-15T10:00:00Z",
        "data": { "status": "SUBMITTED" }
      },
      {
        "type": "document_upload",
        "timestamp": "2024-01-15T10:05:00Z",
        "data": {
          "documentType": "resume",
          "fileName": "resume.pdf"
        }
      },
      {
        "type": "status_change",
        "timestamp": "2024-01-15T10:30:00Z",
        "data": {
          "from": "SUBMITTED",
          "to": "UNDER_REVIEW",
          "reason": "Initial screening"
        }
      }
    ]
  },
  "count": 3,
  "timestamp": "2024-01-15T10:45:00Z"
}
```

---

## 3. Bulk Operations

### 3.1 Apply to Multiple Jobs

Submit applications to multiple jobs in a single request.

**Endpoint:** `POST /bulk/apply`

**Request:**
- **Headers:** 
  - `x-user-id: <user_id>`
  - `Content-Type: application/json`

- **Body:**
  - `jobIds`: string[] - Array of job IDs
  - `commonData`: object - Shared application data
    - `emailAddress`: string (required)
    - `fullName`: string (required)
    - `coverLetter`: string (optional)
    - `yearsOfExperience`: number (optional)
    - `salaryExpectation`: number (optional)

**Example:**
```bash
curl -X POST http://localhost:3003/api/v1/applications/bulk/apply \
  -H "x-user-id: user123" \
  -H "Content-Type: application/json" \
  -d '{
    "jobIds": [
      "job-uuid-1",
      "job-uuid-2",
      "job-uuid-3"
    ],
    "commonData": {
      "emailAddress": "john@example.com",
      "fullName": "John Doe",
      "coverLetter": "I am interested in these positions...",
      "yearsOfExperience": 5
    }
  }'
```

**Response (201):**
```json
{
  "success": true,
  "message": "Applied to 3 jobs",
  "data": {
    "successful": [
      {
        "id": "app-uuid-1",
        "jobId": "job-uuid-1",
        "applicantId": "user123",
        "status": "SUBMITTED"
      },
      {
        "id": "app-uuid-2",
        "jobId": "job-uuid-2",
        "applicantId": "user123",
        "status": "SUBMITTED"
      },
      {
        "id": "app-uuid-3",
        "jobId": "job-uuid-3",
        "applicantId": "user123",
        "status": "SUBMITTED"
      }
    ],
    "failed": []
  },
  "stats": {
    "successCount": 3,
    "failureCount": 0
  },
  "timestamp": "2024-01-15T11:00:00Z"
}
```

---

### 3.2 Bulk Update Application Status

Update status for multiple applications at once.

**Endpoint:** `PATCH /bulk/status`

**Request:**
- **Headers:** 
  - `x-user-id: <user_id>`
  - `Content-Type: application/json`

- **Body:**
  - `applicationIds`: string[] - Array of application IDs
  - `status`: enum - New status for all applications
  - `reason`: string (optional) - Reason for status change

**Example:**
```bash
curl -X PATCH http://localhost:3003/api/v1/applications/bulk/status \
  -H "x-user-id: recruiter123" \
  -H "Content-Type: application/json" \
  -d '{
    "applicationIds": [
      "app-uuid-1",
      "app-uuid-2"
    ],
    "status": "SHORTLISTED",
    "reason": "Passed initial screening"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "message": "Updated 2 applications",
  "data": {
    "failed": []
  },
  "stats": {
    "updatedCount": 2,
    "failureCount": 0
  },
  "timestamp": "2024-01-15T11:05:00Z"
}
```

---

### 3.3 Get Applications with Filtering

Retrieve applications with advanced filtering and pagination.

**Endpoint:** `GET /`

**Query Parameters:**
- `status`: enum - Filter by status
- `jobId`: uuid - Filter by job ID
- `applicantId`: uuid - Filter by applicant ID
- `startupId`: uuid - Filter by startup ID
- `sortBy`: enum (`newest`, `oldest`, `status`, `quality`) - Sort order
- `page`: number (default: 1) - Page number
- `limit`: number (default: 50, max: 100) - Results per page

**Example:**
```bash
curl "http://localhost:3003/api/v1/applications?status=SHORTLISTED&sortBy=newest&page=1&limit=20" \
  -H "x-user-id: recruiter123"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "app-uuid",
        "jobId": "job-uuid",
        "applicantId": "user-uuid",
        "status": "SHORTLISTED",
        "fullName": "John Doe",
        "emailAddress": "john@example.com",
        "resumeScore": 85,
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    },
    "facets": {
      "statuses": [
        { "status": "SHORTLISTED", "count": 45 },
        { "status": "UNDER_REVIEW", "count": 65 },
        { "status": "SUBMITTED", "count": 40 }
      ]
    }
  },
  "timestamp": "2024-01-15T11:10:00Z"
}
```

---

## 4. Analytics

### 4.1 Get Application Analytics

Retrieve detailed analytics for a specific application.

**Endpoint:** `GET /:applicationId/analytics`

**Request:**
- **Headers:** `x-user-id: <user_id>`

**Example:**
```bash
curl http://localhost:3003/api/v1/applications/550e8400-e29b-41d4-a716-446655440000/analytics \
  -H "x-user-id: user123"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "id": "analytics-uuid",
      "applicationId": "app-uuid",
      "jobId": "job-uuid",
      "funnelStage": "interviewed",
      "submissionTimeMs": 180000,
      "viewCount": 3,
      "daysInReview": 2,
      "daysToDecision": 5,
      "matchScore": 82,
      "qualityScore": 78,
      "competitivenessRank": 2,
      "respondedAt": "2024-01-15T12:00:00Z",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  },
  "timestamp": "2024-01-15T11:15:00Z"
}
```

---

### 4.2 Get Recruiting Pipeline Analytics

Analyze the complete recruiting pipeline for a startup.

**Endpoint:** `GET /analytics/pipeline`

**Query Parameters:**
- `startupId`: uuid (required) - Startup ID
- `jobId`: uuid (optional) - Filter by specific job

**Example:**
```bash
curl "http://localhost:3003/api/v1/applications/analytics/pipeline?startupId=startup-uuid" \
  -H "x-user-id: recruiter123"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "totalApplications": 250,
      "funnelStages": {
        "applied": 250,
        "reviewed": 180,
        "shortlisted": 45,
        "interviewed": 15,
        "offered": 5,
        "hired": 3,
        "rejected": 170
      },
      "conversionRates": {
        "appliedToReviewed": 72,
        "reviewedToShortlisted": 25,
        "shortlistedToInterviewed": 33.33,
        "interviewedToOffered": 33.33,
        "offeredToHired": 60
      },
      "timings": {
        "avgTimeToFirstResponse": 1.5,
        "avgTimeToDecision": 5.2,
        "avgDaysInReview": 2.8
      },
      "topDropOffReason": "Doesn't match salary expectations"
    }
  },
  "timestamp": "2024-01-15T11:20:00Z"
}
```

---

### 4.3 Get Quality Metrics

Analyze application quality for recruiting strategy.

**Endpoint:** `GET /analytics/quality`

**Query Parameters:**
- `startupId`: uuid (required) - Startup ID
- `jobId`: uuid (optional) - Filter by specific job

**Example:**
```bash
curl "http://localhost:3003/api/v1/applications/analytics/quality?startupId=startup-uuid" \
  -H "x-user-id: recruiter123"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalApplications": 250,
      "avgMatchScore": 72.5,
      "avgResponseRate": 68,
      "topApplicants": [
        {
          "id": "app-uuid-1",
          "applicantName": "Jane Smith",
          "matchScore": 95,
          "yearsOfExperience": 8
        },
        {
          "id": "app-uuid-2",
          "applicantName": "John Doe",
          "matchScore": 88,
          "yearsOfExperience": 6
        }
      ],
      "qualityDistribution": {
        "excellent": 45,
        "good": 95,
        "average": 80,
        "poor": 30
      }
    }
  },
  "timestamp": "2024-01-15T11:25:00Z"
}
```

---

## Error Responses

### 400 - Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Valid email address is required",
      "param": "emailAddress",
      "location": "body"
    }
  ],
  "timestamp": "2024-01-15T11:30:00Z"
}
```

### 401 - Authentication Error
```json
{
  "success": false,
  "message": "User authentication required",
  "timestamp": "2024-01-15T11:30:00Z"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Application not found",
  "timestamp": "2024-01-15T11:30:00Z"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "timestamp": "2024-01-15T11:30:00Z"
}
```

---

## WebSocket Events (Notifications)

Subscribe to real-time application status updates:

```javascript
const socket = io('http://localhost:3003');

socket.on('application:status_changed', (data) => {
  console.log('Application status updated:', data);
  // {
  //   applicationId: "app-uuid",
  //   previousStatus: "UNDER_REVIEW",
  //   newStatus: "SHORTLISTED",
  //   changedAt: "2024-01-15T11:45:00Z"
  // }
});

socket.on('application:document_uploaded', (data) => {
  console.log('Document uploaded:', data);
  // {
  //   applicationId: "app-uuid",
  //   documentType: "resume",
  //   fileName: "resume.pdf"
  // }
});
```

---

## Rate Limiting

- **Standard Users:** 100 requests/minute
- **Bulk Operations:** 10 requests/minute
- **Analytics:** 50 requests/minute

---

## Best Practices

1. **Resume Upload:** Always upload primary resume before sending notifications
2. **Status Updates:** Include reason for rejections for feedback to applicants
3. **Bulk Operations:** Use bulk endpoints for >5 concurrent operations
4. **Analytics:** Cache pipeline analytics (updated hourly) for better performance
5. **Error Handling:** Implement exponential backoff for failed bulk operations

---

## Integration Examples

### Example 1: Complete Application Workflow

```bash
# 1. Apply to job
curl -X POST http://localhost:3003/api/v1/applications \
  -H "x-user-id: user123" \
  -H "Content-Type: application/json" \
  -d '{ "jobId": "job-uuid", "emailAddress": "john@example.com", ... }'

# 2. Upload resume
curl -X POST http://localhost:3003/api/v1/applications/app-uuid/documents \
  -H "x-user-id: user123" \
  -F "file=@resume.pdf" \
  -F "documentType=resume"

# 3. Check status
curl http://localhost:3003/api/v1/applications/app-uuid/status \
  -H "x-user-id: user123"
```

### Example 2: Recruiter Dashboard

```bash
# Get applications for all jobs
curl "http://localhost:3003/api/v1/applications?startupId=startup-uuid&sortBy=newest" \
  -H "x-user-id: recruiter123"

# Get pipeline analytics
curl "http://localhost:3003/api/v1/applications/analytics/pipeline?startupId=startup-uuid" \
  -H "x-user-id: recruiter123"

# Get quality metrics
curl "http://localhost:3003/api/v1/applications/analytics/quality?startupId=startup-uuid" \
  -H "x-user-id: recruiter123"
```

