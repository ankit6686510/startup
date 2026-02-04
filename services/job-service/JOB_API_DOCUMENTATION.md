# Job Management API Documentation

## Overview

Complete REST API for job management with advanced features including recommendations, analytics, saved jobs, and comprehensive search capabilities.

**Base URL:** `http://localhost:3003/api/v1/jobs`

**Authentication:** Most endpoints require authentication via `x-user-id` header

---

## 📋 Table of Contents

1. [Job CRUD Operations](#job-crud-operations)
2. [Advanced Search & Filtering](#advanced-search--filtering)
3. [Job Recommendations](#job-recommendations)
4. [Analytics & Tracking](#analytics--tracking)
5. [Saved Jobs](#saved-jobs)
6. [Job Applications](#job-applications)

---

## Job CRUD Operations

### Create Job

Create a new job posting.

**Endpoint:** `POST /api/v1/jobs`

**Headers:**
```
Content-Type: application/json
x-user-id: <user-id>
```

**Request Body:**
```json
{
  "startupId": "uuid",
  "title": "Senior Full Stack Engineer",
  "description": "We're looking for an experienced full-stack engineer...",
  "requirements": "5+ years of experience with React and Node.js...",
  "responsibilities": "Design and implement new features...",
  "benefits": "Competitive salary, equity, health insurance...",
  "type": "FULL_TIME",
  "locationType": "HYBRID",
  "experienceLevel": "SENIOR",
  "category": "ENGINEERING",
  "locationCountry": "United States",
  "locationCountryCode": "US",
  "locationCity": "San Francisco",
  "locationState": "California",
  "isRemoteAllowed": true,
  "salaryMin": 120000,
  "salaryMax": 180000,
  "salaryCurrency": "USD",
  "salaryEquityMin": 0.1,
  "salaryEquityMax": 0.5,
  "skills": ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
  "tags": ["startup", "fintech", "remote-friendly"],
  "yearsExperienceMin": 5,
  "yearsExperienceMax": 10,
  "educationLevel": "Bachelor's degree or equivalent",
  "applicationDeadline": "2026-03-31T00:00:00.000Z",
  "isFeatured": false,
  "isUrgent": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {
    "job": {
      "id": "uuid",
      "slug": "senior-full-stack-engineer",
      "title": "Senior Full Stack Engineer",
      ...
    }
  },
  "timestamp": "2026-01-29T10:00:00.000Z"
}
```

---

### Update Job

Update an existing job posting.

**Endpoint:** `PUT /api/v1/jobs/:id`

**Headers:**
```
Content-Type: application/json
x-user-id: <user-id>
```

**Request Body:** (partial update supported)
```json
{
  "title": "Senior Full Stack Engineer (Updated)",
  "salaryMax": 200000,
  "isActive": true
}
```

---

### Get Job by ID

Fetch a specific job by ID.

**Endpoint:** `GET /api/v1/jobs/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "uuid",
      "title": "Senior Full Stack Engineer",
      "viewCount": 1250,
      "applicationCount": 45,
      ...
    }
  },
  "timestamp": "2026-01-29T10:00:00.000Z"
}
```

---

### Get Job by Slug

Fetch a job by its URL-friendly slug. Automatically increments view count.

**Endpoint:** `GET /api/v1/jobs/slug/:slug`

**Example:** `GET /api/v1/jobs/slug/senior-full-stack-engineer`

---

### Get All Jobs

List all active jobs with optional filtering.

**Endpoint:** `GET /api/v1/jobs`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `search` - Search in title, description, skills
- `category` - Filter by job category
- `type` - Filter by job type (FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP)
- `locationType` - Filter by location type (REMOTE, ON_SITE, HYBRID)
- `experienceLevel` - Filter by experience level
- `location` - Filter by city/state/country
- `salaryMin` - Minimum salary requirement
- `salaryMax` - Maximum salary requirement
- `skills[]` - Array of required skills
- `startupIds[]` - Filter by specific startups
- `isRemote` - Boolean for remote jobs only
- `isFeatured` - Boolean for featured jobs
- `postedSince` - ISO date string

**Example:**
```
GET /api/v1/jobs?category=ENGINEERING&type=FULL_TIME&salaryMin=100000&skills[]=React&skills[]=Node.js&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [ ... ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    },
    "filters": { ... }
  },
  "timestamp": "2026-01-29T10:00:00.000Z"
}
```

---

### Get Featured Jobs

Get featured/promoted job listings.

**Endpoint:** `GET /api/v1/jobs/featured`

**Query Parameters:**
- `limit` (default: 10)

---

### Get Jobs by Startup

Get all jobs posted by a specific startup.

**Endpoint:** `GET /api/v1/jobs/startup/:startupId`

**Query Parameters:**
- `includeInactive` (default: false) - Include inactive/expired jobs

---

### Delete Job

Soft delete a job (marks as inactive).

**Endpoint:** `DELETE /api/v1/jobs/:id`

**Headers:**
```
x-user-id: <user-id>
```

---

### Get Job Statistics

Get aggregate statistics for jobs.

**Endpoint:** `GET /api/v1/jobs/stats`

**Query Parameters:**
- `startupId` (optional) - Filter stats by startup

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalJobs": 1250,
      "activeJobs": 980,
      "totalApplications": 15000,
      "featuredJobs": 45,
      "averageApplicationsPerJob": 12
    }
  },
  "timestamp": "2026-01-29T10:00:00.000Z"
}
```

---

## Advanced Search & Filtering

### Advanced Search with Facets

Powerful search with relevance scoring and faceted filters.

**Endpoint:** `GET /api/v1/jobs/search/advanced`

**Query Parameters:**
- `q` - Search query (optional)
- `page`, `limit` - Pagination
- `sort` - Sort order: `relevance`, `date`, `salary`, `applications`
- `includeFacets` - Boolean to include facet counts
- All standard filter parameters (category, type, location, etc.)

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [ ... ],
    "facets": {
      "categories": [
        { "value": "ENGINEERING", "count": 245 },
        { "value": "DESIGN", "count": 89 }
      ],
      "types": [
        { "value": "FULL_TIME", "count": 567 },
        { "value": "CONTRACT", "count": 123 }
      ],
      "experienceLevels": [
        { "value": "SENIOR", "count": 189 },
        { "value": "MID", "count": 234 }
      ],
      "locations": [
        { "city": "San Francisco", "country": "United States", "count": 156 }
      ]
    }
  },
  "meta": {
    "pagination": { ... },
    "filters": { ... },
    "sort": "relevance"
  },
  "timestamp": "2026-01-29T10:00:00.000Z"
}
```

**Relevance Scoring:**
- Exact title match: 100 points
- Title starts with query: 80 points
- Title contains query: 60 points
- Skills match: 40 points
- Description contains query: 20 points

---

## Job Recommendations

### Get Personalized Recommendations

Get AI-powered job recommendations based on user profile.

**Endpoint:** `POST /api/v1/jobs/recommendations/for-you`

**Headers:**
```
Content-Type: application/json
x-user-id: <user-id>
```

**Request Body:**
```json
{
  "userProfile": {
    "skills": ["React", "TypeScript", "Node.js", "AWS"],
    "experience": 5,
    "location": {
      "country": "United States",
      "city": "San Francisco"
    },
    "preferences": {
      "jobTypes": ["FULL_TIME"],
      "categories": ["ENGINEERING"],
      "salaryMin": 120000,
      "remoteOnly": false
    }
  },
  "excludeJobIds": ["uuid1", "uuid2"]
}
```

**Query Parameters:**
- `limit` (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "job": { ... },
        "score": 85,
        "reasons": [
          "Matches 4 of your skills: React, TypeScript, Node.js, AWS",
          "Located in San Francisco",
          "senior level position",
          "Meets your salary expectations"
        ]
      }
    ]
  },
  "meta": {
    "total": 20,
    "algorithm": "skill-based-scoring"
  },
  "timestamp": "2026-01-29T10:00:00.000Z"
}
```

**Scoring Algorithm:**
- Skills match: 40 points max
- Experience level match: 20 points
- Location match: 15 points
- Job type preference: 10 points
- Category preference: 10 points
- Salary match: 5 points
- Remote preference: 10 points
- Featured job boost: 5 points
- Recency bonus (0-7 days): 3-5 points

---

### Get Similar Jobs

Find jobs similar to a given job.

**Endpoint:** `GET /api/v1/jobs/recommendations/similar/:jobId`

**Query Parameters:**
- `limit` (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [ ... ]
  },
  "meta": {
    "referenceJobId": "uuid",
    "total": 10
  },
  "timestamp": "2026-01-29T10:00:00.000Z"
}
```

---

### Get Trending Jobs

Get jobs with high engagement in recent period.

**Endpoint:** `GET /api/v1/jobs/recommendations/trending`

**Query Parameters:**
- `limit` (default: 20)
- `timeWindow` (default: 7) - Days to look back

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [ ... ]
  },
  "meta": {
    "total": 20,
    "timeWindow": "7 days"
  },
  "timestamp": "2026-01-29T10:00:00.000Z"
}
```

**Trending Score:** Views + (Saves × 2) + (Applications × 3)

---

### Get Missed Jobs

Jobs the user may have missed based on their activity.

**Endpoint:** `GET /api/v1/jobs/recommendations/missed`

**Headers:**
```
x-user-id: <user-id>
```

**Query Parameters:**
- `limit` (default: 10)

---

## Analytics & Tracking

### Track Job View

Record when a user views a job.

**Endpoint:** `POST /api/v1/jobs/:jobId/track/view`

**Request Body:**
```json
{
  "sessionId": "session-uuid",
  "utmParams": {
    "source": "linkedin",
    "medium": "social",
    "campaign": "job-launch"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "viewId": "view-uuid"
  },
  "timestamp": "2026-01-29T10:00:00.000Z"
}
```

---

### Update View Engagement

Update engagement metrics for a specific view.

**Endpoint:** `PUT /api/v1/jobs/track/view/:viewId/engagement`

**Request Body:**
```json
{
  "timeSpent": 125,
  "clickedApply": true,
  "clickedSave": false,
  "clickedShare": false,
  "scrolledPercentage": 85
}
```

---

### Get Job Analytics

Get detailed analytics for a specific job.

**Endpoint:** `GET /api/v1/jobs/:jobId/analytics`

**Query Parameters:**
- `startDate` (optional) - ISO date string
- `endDate` (optional) - ISO date string

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalViews": 1250,
      "uniqueViews": 980,
      "totalApplications": 45,
      "totalSaves": 123,
      "totalShares": 34,
      "conversionRate": 3.6,
      "avgTimeSpent": 145.5
    },
    "daily": [
      {
        "date": "2026-01-20",
        "totalViews": 156,
        "uniqueViews": 134,
        "totalApplications": 8,
        "conversionRate": 5.13,
        "trafficSources": {
          "direct": 45,
          "organic": 67,
          "social": 34,
          "email": 10
        },
        "deviceBreakdown": {
          "mobile": 78,
          "tablet": 12,
          "desktop": 66
        }
      }
    ],
    "totalViews": 1250,
    "totalApplications": 45,
    "conversionRate": 3.6
  },
  "timestamp": "2026-01-29T10:00:00.000Z"
}
```

---

### Get Startup Job Analytics

Get aggregated analytics for all jobs from a startup.

**Endpoint:** `GET /api/v1/jobs/analytics/startup/:startupId`

**Query Parameters:**
- `period` (default: 30) - Number of days

**Response:**
```json
{
  "success": true,
  "data": {
    "period": 30,
    "totalJobs": 15,
    "activeJobs": 12,
    "totalViews": 8750,
    "totalApplications": 234,
    "avgConversionRate": 2.67,
    "topPerformingJobs": [
      {
        "id": "uuid",
        "title": "Senior Backend Engineer",
        "views": 1200,
        "applications": 45,
        "conversionRate": 3.75
      }
    ]
  },
  "timestamp": "2026-01-29T10:00:00.000Z"
}
```

---

### Track Job Save

Track when a user saves a job (for analytics).

**Endpoint:** `POST /api/v1/jobs/:jobId/track/save`

---

### Track Job Share

Track when a user shares a job.

**Endpoint:** `POST /api/v1/jobs/:jobId/track/share`

**Request Body:**
```json
{
  "platform": "linkedin"
}
```

---

### Track Apply Click

Track when a user clicks the apply button.

**Endpoint:** `POST /api/v1/jobs/:jobId/track/apply-click`

---

## Saved Jobs

### Save Job

Save/bookmark a job for later.

**Endpoint:** `POST /api/v1/jobs/:jobId/save`

**Headers:**
```
Content-Type: application/json
x-user-id: <user-id>
```

**Request Body:**
```json
{
  "notes": "Great fit for my skills"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job saved successfully",
  "data": {
    "savedJob": {
      "id": "uuid",
      "userId": "uuid",
      "jobId": "uuid",
      "notes": "Great fit for my skills",
      "createdAt": "2026-01-29T10:00:00.000Z"
    }
  },
  "timestamp": "2026-01-29T10:00:00.000Z"
}
```

---

### Unsave Job

Remove a job from saved list.

**Endpoint:** `DELETE /api/v1/jobs/:jobId/save`

**Headers:**
```
x-user-id: <user-id>
```

---

### Get Saved Jobs

Get all jobs saved by the user.

**Endpoint:** `GET /api/v1/jobs/saved/my-jobs`

**Headers:**
```
x-user-id: <user-id>
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "savedJobs": [
      {
        "id": "saved-job-uuid",
        "notes": "Great fit",
        "createdAt": "2026-01-25T10:00:00.000Z",
        "job": {
          "id": "job-uuid",
          "title": "Senior Full Stack Engineer",
          ...
        }
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  },
  "timestamp": "2026-01-29T10:00:00.000Z"
}
```

---

## Error Responses

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ],
  "timestamp": "2026-01-29T10:00:00.000Z"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Rate Limiting

- Window: 15 minutes
- Max Requests: 100 per IP
- Headers returned:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

---

## Best Practices

1. **Always track views** when displaying jobs to users
2. **Use pagination** for list endpoints to optimize performance
3. **Include facets** in search responses to build filter UI
4. **Track engagement** to improve recommendations
5. **Use advanced search** for complex filtering requirements
6. **Cache recommendation** results for better UX
7. **Update saved jobs** engagement data for analytics

---

## Example Integration

```typescript
// Track job view and engagement
const viewResponse = await fetch('/api/v1/jobs/job-id/track/view', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': userId
  },
  body: JSON.stringify({
    sessionId: getSessionId(),
    utmParams: getUTMParams()
  })
});

const { data: { viewId } } = await viewResponse.json();

// Later, update engagement
await fetch(`/api/v1/jobs/track/view/${viewId}/engagement`, {
  method: 'PUT',
  body: JSON.stringify({
    timeSpent: 120,
    scrolledPercentage: 90,
    clickedApply: true
  })
});

// Get personalized recommendations
const recommendations = await fetch('/api/v1/jobs/recommendations/for-you', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': userId
  },
  body: JSON.stringify({
    userProfile: {
      skills: ['React', 'TypeScript'],
      experience: 5,
      preferences: {
        salaryMin: 100000,
        remoteOnly: true
      }
    }
  })
});
```

---

## Next Steps

1. Implement frontend integration with React Query
2. Set up real-time notifications for job matches
3. Add email alerts for new matching jobs
4. Implement A/B testing for recommendation algorithms
5. Add machine learning for better personalization

---

For questions or support, contact the backend team.
