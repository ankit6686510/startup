# Job Management System - Complete Implementation

## 🎉 What's New

Your Job Service now includes a **comprehensive, production-ready** Job Management API with:

### ✅ Implemented Features

#### 1. **Complete Job CRUD Operations**
- Create, Read, Update, Delete jobs
- Soft delete support
- Job expiration handling
- Bulk operations support

#### 2. **Advanced Search & Filtering**
- Full-text search with relevance scoring
- Faceted search with real-time counts
- Multiple filter combinations
- Sort by relevance, date, salary, applications
- Location-based filtering
- Skill-based matching

#### 3. **Intelligent Job Recommendations**
- **Personalized recommendations** based on user profile
- Skill-based matching with weighted scoring
- Experience level compatibility
- Location and salary preference matching
- **Similar jobs** algorithm
- **Trending jobs** based on engagement metrics
- **Missed opportunities** detection

#### 4. **Comprehensive Analytics & Tracking**
- Job view tracking with detailed metadata
- Engagement metrics (time spent, scroll depth, clicks)
- Daily analytics aggregation
- Conversion rate tracking
- Traffic source analysis
- Device and browser breakdown
- Geographic data tracking
- UTM parameter tracking
- Startup-wide analytics dashboard

#### 5. **Saved Jobs Management**
- Save/bookmark jobs
- Personal notes on saved jobs
- Priority levels
- Reminders and notifications
- Tags for organization

#### 6. **Job Applications** (Existing)
- Application submission
- Status tracking
- Application history

---

## 🏗️ Architecture

### New Models Created

1. **JobView** - Tracks every job view with:
   - User identification (authenticated or anonymous)
   - Session tracking
   - IP address and geolocation
   - Device and browser detection
   - Referrer and UTM parameters
   - Engagement metrics (time spent, scrolled percentage, clicks)

2. **JobAnalytics** - Daily aggregated analytics per job:
   - View metrics (total, unique, authenticated, anonymous)
   - Application metrics
   - Engagement metrics (avg time, saves, shares)
   - Conversion rates
   - Traffic source breakdown
   - Device breakdown
   - Geographic data

### Services

1. **JobService** (Enhanced)
   - All CRUD operations
   - Advanced search with facets
   - Analytics tracking
   - View tracking
   - Saved jobs management

2. **RecommendationService** (New)
   - Personalized recommendations
   - Similar jobs algorithm
   - Trending jobs calculation
   - Missed opportunities detection
   - Intelligent scoring system

---

## 📊 Recommendation Algorithm

### Scoring System (100 points max)

```
Skills Match:           40 points (highest weight)
Experience Level:       20 points
Location Match:         15 points
Job Type Preference:    10 points
Category Preference:    10 points
Remote Preference:      10 points
Salary Match:           5 points
Featured Job Boost:     5 points
Recency Bonus:          3-5 points
```

### How It Works

1. **Skills Matching**
   - Calculates overlap between job requirements and user skills
   - Supports partial matching (e.g., "React" matches "React.js")
   - Weighted by total required skills

2. **Experience Level Matching**
   - Maps years of experience to levels (Intern, Entry, Mid, Senior, Lead, Executive)
   - Perfect match: 1.0, Under-qualified: 0.3, Over-qualified: 0.7

3. **Location Matching**
   - Remote jobs always score 1.0
   - Country match: 0.7, City match: +0.3

4. **Trending Algorithm**
   - Score = Views + (Saves × 2) + (Applications × 3)
   - Time window configurable (default 7 days)

---

## 🚀 Quick Start

### 1. Install Dependencies

Already included in your `package.json`:
- `typeorm` - ORM for database operations
- `express-validator` - Input validation
- All existing dependencies

### 2. Update Database

The new entities are already configured in [database.ts](src/config/database.ts).

Run migrations:
```bash
cd services/job-service
npm run migration:generate -- CreateJobViewAndAnalytics
npm run migration:run
```

Or use synchronize in development (already enabled):
```typescript
synchronize: process.env.NODE_ENV === 'development'
```

### 3. Start the Service

```bash
npm run dev
```

The service will run on `http://localhost:3003`

---

## 📖 API Usage Examples

### Example 1: Get Personalized Recommendations

```typescript
const response = await fetch('http://localhost:3003/api/v1/jobs/recommendations/for-you', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': 'user-uuid'
  },
  body: JSON.stringify({
    userProfile: {
      skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
      experience: 5,
      location: {
        country: 'United States',
        city: 'San Francisco'
      },
      preferences: {
        jobTypes: ['FULL_TIME'],
        categories: ['ENGINEERING'],
        salaryMin: 120000,
        remoteOnly: false
      }
    }
  })
});

const { data } = await response.json();
// Returns jobs sorted by relevance score with reasons
```

### Example 2: Advanced Search with Facets

```typescript
const response = await fetch(
  'http://localhost:3003/api/v1/jobs/search/advanced?' +
  new URLSearchParams({
    q: 'full stack engineer',
    category: 'ENGINEERING',
    salaryMin: '100000',
    skills: ['React', 'Node.js'],
    sort: 'relevance',
    includeFacets: 'true',
    page: '1',
    limit: '20'
  })
);

const { data, meta } = await response.json();
// Returns jobs + facets for building filter UI
```

### Example 3: Track Job View with Analytics

```typescript
// When user opens a job
const viewResponse = await fetch(`http://localhost:3003/api/v1/jobs/${jobId}/track/view`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': 'user-uuid'
  },
  body: JSON.stringify({
    sessionId: getSessionId(),
    utmParams: {
      source: 'linkedin',
      medium: 'social',
      campaign: 'q1-hiring'
    }
  })
});

const { data: { viewId } } = await viewResponse.json();

// Track user engagement
setTimeout(() => {
  fetch(`http://localhost:3003/api/v1/jobs/track/view/${viewId}/engagement`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timeSpent: 125, // seconds
      scrolledPercentage: 85,
      clickedApply: true
    })
  });
}, 125000);
```

### Example 4: Get Job Analytics

```typescript
const response = await fetch(
  `http://localhost:3003/api/v1/jobs/${jobId}/analytics?` +
  new URLSearchParams({
    startDate: '2026-01-01',
    endDate: '2026-01-31'
  })
);

const { data } = await response.json();
/*
{
  overview: {
    totalViews: 1250,
    uniqueViews: 980,
    totalApplications: 45,
    conversionRate: 3.6,
    avgTimeSpent: 145.5
  },
  daily: [...],
  ...
}
*/
```

### Example 5: Save Job

```typescript
const response = await fetch(`http://localhost:3003/api/v1/jobs/${jobId}/save`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': 'user-uuid'
  },
  body: JSON.stringify({
    notes: 'Perfect match for my skills!'
  })
});
```

---

## 🔧 Configuration

### Environment Variables

Add to your `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=startup_platform_jobs

# Server
PORT=3003
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## 🧪 Testing

### Manual Testing with cURL

```bash
# Create a job
curl -X POST http://localhost:3003/api/v1/jobs \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{
    "startupId": "startup-456",
    "title": "Senior Backend Engineer",
    "description": "We are looking for...",
    "type": "FULL_TIME",
    "locationType": "REMOTE",
    "experienceLevel": "SENIOR",
    "category": "ENGINEERING",
    "skills": ["Node.js", "TypeScript", "PostgreSQL"],
    "salaryMin": 120000,
    "salaryMax": 180000
  }'

# Get recommendations
curl -X POST http://localhost:3003/api/v1/jobs/recommendations/for-you \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{
    "userProfile": {
      "skills": ["Node.js", "TypeScript"],
      "experience": 5
    }
  }'

# Search jobs
curl "http://localhost:3003/api/v1/jobs?search=engineer&category=ENGINEERING&salaryMin=100000"

# Get trending jobs
curl "http://localhost:3003/api/v1/jobs/recommendations/trending?limit=10&timeWindow=7"
```

---

## 📈 Analytics Dashboard Integration

### Frontend Integration Example (React)

```typescript
// JobAnalyticsDashboard.tsx
import { useQuery } from '@tanstack/react-query';

const JobAnalyticsDashboard = ({ jobId }) => {
  const { data } = useQuery({
    queryKey: ['jobAnalytics', jobId],
    queryFn: () => 
      fetch(`/api/v1/jobs/${jobId}/analytics`)
        .then(res => res.json())
  });

  return (
    <div>
      <h2>Job Performance</h2>
      <div>
        <Metric label="Views" value={data?.overview.totalViews} />
        <Metric label="Applications" value={data?.overview.totalApplications} />
        <Metric label="Conversion Rate" value={`${data?.overview.conversionRate}%`} />
      </div>
      <Chart data={data?.daily} />
    </div>
  );
};
```

---

## 🔄 Data Flow

### View Tracking Flow

```
User Opens Job
    ↓
POST /jobs/:id/track/view
    ↓
Create JobView record
    ↓
Increment job.viewCount
    ↓
Update daily JobAnalytics
    ↓
Return viewId to frontend
    ↓
User interacts with page
    ↓
PUT /track/view/:viewId/engagement
    ↓
Update engagement metrics
```

### Recommendation Flow

```
User Profile + Preferences
    ↓
Fetch active jobs (exclude applied/saved)
    ↓
Calculate scores for each job
  ├─ Skills match (40pts)
  ├─ Experience match (20pts)
  ├─ Location match (15pts)
  ├─ Preferences match (20pts)
  └─ Boosts (5-10pts)
    ↓
Sort by score DESC
    ↓
Return top N with reasons
```

---

## 🎯 Performance Optimizations

### Database Indexes

All critical queries are indexed:
- `job_id`, `user_id` for quick lookups
- `created_at`, `date` for time-based queries
- `is_active`, `expires_at` for filtering
- Composite indexes for common query patterns

### Caching Strategy

Recommended caching (not yet implemented, but easy to add):

```typescript
// Redis caching for recommendations
const cacheKey = `recommendations:${userId}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const recommendations = await getRecommendations(userId);
await redis.setex(cacheKey, 3600, JSON.stringify(recommendations));
return recommendations;
```

### Query Optimization

- Pagination on all list endpoints
- Lazy loading with `skip`/`take`
- Selective field loading
- Aggregation at database level

---

## 🚦 Next Steps

### Immediate (Already Done ✅)
- ✅ CRUD operations
- ✅ Advanced search
- ✅ Recommendations engine
- ✅ Analytics tracking
- ✅ Saved jobs

### Short Term (Recommended)
1. **Add unit tests**
   ```bash
   npm run test
   ```

2. **Add integration tests**
   ```typescript
   describe('Job Recommendations', () => {
     it('should return personalized jobs', async () => {
       const response = await request(app)
         .post('/api/v1/jobs/recommendations/for-you')
         .set('x-user-id', 'test-user')
         .send({ userProfile: { skills: ['React'] } });
       
       expect(response.status).toBe(200);
       expect(response.body.data.recommendations).toBeDefined();
     });
   });
   ```

3. **Add Redis caching**
   - Cache recommendation results
   - Cache trending jobs
   - Cache facet counts

4. **Add job alerts via email**
   - Integrate with notification service
   - Send daily/weekly digests
   - Real-time alerts for matches

5. **Implement rate limiting per user**
   - Currently per IP
   - Add per-user quotas

### Medium Term
1. Elasticsearch integration for better search
2. Machine learning for recommendation improvement
3. A/B testing framework
4. Real-time updates via WebSocket
5. Advanced reporting dashboard

### Long Term
1. Natural language job search
2. Resume parsing and matching
3. Interview scheduling integration
4. Video interview capabilities
5. Applicant tracking system (ATS) features

---

## 📚 Complete API Reference

See [JOB_API_DOCUMENTATION.md](./JOB_API_DOCUMENTATION.md) for complete API documentation with all endpoints, parameters, and examples.

---

## 🤝 Integration with Other Services

### User Service Integration

```typescript
// Get user profile for recommendations
const userProfile = await fetch(`http://user-service:3002/api/v1/users/${userId}/profile`)
  .then(res => res.json());

// Pass to recommendations
const recommendations = await fetch('http://job-service:3003/api/v1/jobs/recommendations/for-you', {
  method: 'POST',
  body: JSON.stringify({ userProfile })
});
```

### Startup Service Integration

```typescript
// Enrich job results with startup data
const jobs = await getJobs();
const startupIds = jobs.map(j => j.startupId);
const startups = await fetch(`http://startup-service:3001/api/v1/startups/batch`, {
  method: 'POST',
  body: JSON.stringify({ ids: startupIds })
});
```

### Notification Service Integration

```typescript
// Trigger notification when job matches user profile
await fetch('http://notification-service:3005/api/v1/notifications', {
  method: 'POST',
  body: JSON.stringify({
    userId,
    type: 'JOB_RECOMMENDATION',
    data: { jobId, jobTitle, matchScore }
  })
});
```

---

## 🐛 Troubleshooting

### Common Issues

1. **Database connection errors**
   - Verify PostgreSQL is running
   - Check credentials in `.env`
   - Ensure database exists

2. **Recommendations returning empty**
   - Check if jobs exist and are active
   - Verify user profile has skills
   - Check excluded job IDs

3. **Analytics not updating**
   - Verify JobAnalytics table exists
   - Check daily aggregation cron job
   - Review logs for errors

---

## 📄 License

Part of the StartupCompass platform.

---

## 👥 Team

Backend Team - Job Service Module

For questions, create an issue or contact the backend team.

---

**You now have a production-ready Job Management API with advanced features! 🎉**
