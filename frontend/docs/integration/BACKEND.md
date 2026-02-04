# Backend Integration Guide

## 🔌 Dashboard API Integration

### Overview
The dashboard frontend is ready for backend integration. This guide outlines exactly what API endpoints the frontend expects and the response formats.

---

## 📋 API Endpoints Required

### 1. GET `/api/dashboard`
**Purpose**: Fetch complete dashboard data (all sections at once)

**Request**:
```http
GET /api/dashboard
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "stats": {
    "startupsFollowed": 12,
    "jobsSaved": 8,
    "fundingOpportunities": 5,
    "watchlistItems": 25
  },
  "activities": [
    {
      "id": "activity_1",
      "type": "startup_followed",
      "title": "TechStartup Inc",
      "description": "You followed TechStartup Inc",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "trendingStartups": [
    {
      "id": "startup_1",
      "name": "TechVision",
      "logo": "https://...",
      "trendScore": 85,
      "followers": 1250,
      "fundingAmount": 5000000,
      "fundingCurrency": "USD"
    }
  ],
  "watchlist": [
    {
      "id": "watch_1",
      "name": "Senior Engineer - TechCorp",
      "type": "job",
      "status": "active",
      "addedAt": "2024-01-10T14:20:00Z"
    }
  ],
  "news": [
    {
      "id": "news_1",
      "title": "Top 10 Startups to Watch in 2024",
      "summary": "A curated list of emerging startups...",
      "image": "https://...",
      "category": "Trends",
      "source": "StartupWeekly",
      "sourceUrl": "https://...",
      "publishedAt": "2024-01-14T09:00:00Z"
    }
  ]
}
```

---

### 2. GET `/api/dashboard/stats`
**Purpose**: Fetch only dashboard statistics

**Request**:
```http
GET /api/dashboard/stats
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "startupsFollowed": 12,
  "jobsSaved": 8,
  "fundingOpportunities": 5,
  "watchlistItems": 25
}
```

---

### 3. GET `/api/dashboard/activity`
**Purpose**: Fetch recent user activities

**Request**:
```http
GET /api/dashboard/activity?limit=5
Authorization: Bearer {token}
```

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 5 | Number of activities to return |
| `offset` | integer | 0 | Pagination offset |
| `type` | string | optional | Filter by activity type |
| `startDate` | ISO string | optional | Filter from date |
| `endDate` | ISO string | optional | Filter to date |

**Response** (200 OK):
```json
{
  "activities": [
    {
      "id": "activity_1",
      "type": "startup_followed",
      "title": "TechStartup Inc",
      "description": "You followed TechStartup Inc",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "activity_2",
      "type": "job_saved",
      "title": "Senior Engineer Position",
      "description": "You saved Senior Engineer at TechCorp",
      "createdAt": "2024-01-15T09:15:00Z"
    }
  ],
  "total": 42,
  "hasMore": true
}
```

**Activity Types**:
- `startup_followed` - User followed a startup
- `job_saved` - User saved a job
- `article_read` - User read an article
- `funding_update` - New funding announcement

---

### 4. GET `/api/dashboard/trending`
**Purpose**: Fetch trending startups

**Request**:
```http
GET /api/dashboard/trending?limit=6
Authorization: Bearer {token}
```

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 6 | Number of startups to return |
| `offset` | integer | 0 | Pagination offset |
| `timeframe` | string | week | 'day', 'week', 'month', 'all' |

**Response** (200 OK):
```json
{
  "startups": [
    {
      "id": "startup_1",
      "name": "TechVision",
      "logo": "https://example.com/logo.jpg",
      "trendScore": 95,
      "followers": 1250,
      "fundingAmount": 5000000,
      "fundingCurrency": "USD"
    },
    {
      "id": "startup_2",
      "name": "DataFlow AI",
      "logo": "https://example.com/logo2.jpg",
      "trendScore": 87,
      "followers": 890,
      "fundingAmount": 3500000,
      "fundingCurrency": "USD"
    }
  ],
  "total": 2400
}
```

**Notes**:
- `trendScore`: 0-100 indicating trending popularity
- `fundingAmount` and `fundingCurrency` are optional
- `logo` URL should be valid image URL or null

---

### 5. GET `/api/dashboard/watchlist`
**Purpose**: Fetch user's watchlist items

**Request**:
```http
GET /api/dashboard/watchlist?limit=5
Authorization: Bearer {token}
```

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 5 | Number of items to return |
| `offset` | integer | 0 | Pagination offset |
| `type` | string | optional | Filter: 'startup', 'job', 'funding' |
| `status` | string | optional | Filter: 'active', 'closed', 'expired' |

**Response** (200 OK):
```json
{
  "items": [
    {
      "id": "watch_1",
      "name": "Senior Engineer - TechCorp",
      "type": "job",
      "status": "active",
      "addedAt": "2024-01-10T14:20:00Z"
    },
    {
      "id": "watch_2",
      "name": "TechVision Inc",
      "type": "startup",
      "status": "active",
      "addedAt": "2024-01-12T08:45:00Z"
    },
    {
      "id": "watch_3",
      "name": "Series A Round - DataFlow",
      "type": "funding",
      "status": "closed",
      "addedAt": "2024-01-08T16:30:00Z"
    }
  ],
  "total": 25,
  "hasMore": true,
  "typeCounts": {
    "startup": 8,
    "job": 12,
    "funding": 5
  }
}
```

**Item Types**:
- `startup` - Startup company
- `job` - Job listing
- `funding` - Funding opportunity

**Item Status**:
- `active` - Currently available
- `closed` - Opportunity closed
- `expired` - Listing expired

---

### 6. GET `/api/dashboard/news`
**Purpose**: Fetch latest news and articles

**Request**:
```http
GET /api/dashboard/news?limit=6
Authorization: Bearer {token}
```

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 6 | Number of articles to return |
| `offset` | integer | 0 | Pagination offset |
| `category` | string | optional | Filter by category |
| `source` | string | optional | Filter by source |
| `startDate` | ISO string | optional | Filter from date |

**Response** (200 OK):
```json
{
  "news": [
    {
      "id": "news_1",
      "title": "Top 10 Startups to Watch in 2024",
      "summary": "A curated list of emerging startups reshaping the tech industry...",
      "image": "https://example.com/image.jpg",
      "category": "Trends",
      "source": "StartupWeekly",
      "sourceUrl": "https://startupweekly.com/article",
      "publishedAt": "2024-01-14T09:00:00Z"
    },
    {
      "id": "news_2",
      "title": "AI Funding Reaches Record Highs",
      "summary": "Venture capital funding for AI companies exceeds $50B in 2023...",
      "image": "https://example.com/image2.jpg",
      "category": "Funding",
      "source": "VCInsights",
      "sourceUrl": "https://vcinsights.com/article",
      "publishedAt": "2024-01-13T14:30:00Z"
    }
  ],
  "total": 1205
}
```

---

## 🔐 Authentication

All dashboard endpoints require authentication:

```typescript
// Headers required
{
  "Authorization": "Bearer {accessToken}",
  "Content-Type": "application/json"
}
```

The token is automatically injected by the frontend Axios client. Backend should:
1. Verify the token
2. Extract user ID from token
3. Return user-specific data

---

## ⚠️ Error Responses

All endpoints should return appropriate error codes:

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Access denied"
}
```

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid query parameters"
}
```

### 500 Server Error
```json
{
  "error": "Server Error",
  "message": "Internal server error"
}
```

---

## 🧪 Testing the Integration

### Step 1: Start Frontend
```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:3000
```

### Step 2: Verify Token
Login with test credentials to get JWT token

### Step 3: Test Endpoints
Use curl or Postman to test each endpoint:

```bash
# Get dashboard stats
curl -H "Authorization: Bearer {token}" \
  http://localhost:3000/api/dashboard/stats

# Get activities
curl -H "Authorization: Bearer {token}" \
  http://localhost:3000/api/dashboard/activity?limit=5
```

### Step 4: Monitor Network
1. Open DevTools (F12)
2. Go to Network tab
3. Filter for "dashboard" requests
4. Verify response formats match

---

## 📝 Implementation Notes

### Response Format Standards
- All timestamps should be ISO 8601 format: `2024-01-15T10:30:00Z`
- All IDs should be unique strings (UUID recommended)
- Currency should be 3-letter ISO code (USD, EUR, etc.)
- URLs should be absolute (http/https)
- Images should have appropriate alt text support

### Performance Considerations
- Implement pagination for large datasets
- Cache results appropriately on backend
- Return only necessary fields (no sensitive data)
- Consider GraphQL for more complex queries later

### Data Consistency
- `trendScore` should be normalized 0-100
- `followers` should be integer
- `fundingAmount` should be integer (in smallest unit)
- All dates should be in same timezone (UTC)

---

## 🔄 Related Authentication Endpoints

The dashboard depends on proper authentication. Ensure these endpoints work:

### POST `/api/auth/login`
Authenticates user and returns JWT token

### GET `/api/auth/me`
Returns current user profile

### POST `/api/auth/refresh`
Refreshes expired JWT token

See `AUTH_SETUP.md` for full authentication API details.

---

## 📞 Integration Checklist

- [ ] All 6 endpoints implemented
- [ ] Response formats match TypeScript interfaces
- [ ] Authentication working with JWT tokens
- [ ] Error handling and validation
- [ ] Pagination support
- [ ] Date/time formats correct (ISO 8601)
- [ ] No sensitive data in responses
- [ ] CORS configured properly
- [ ] Rate limiting (if applicable)
- [ ] Performance tested with large datasets
- [ ] Tested with frontend application
- [ ] Documentation updated

---

## 🚀 Quick Start

1. **Implement** the 6 endpoints in order:
   - `/api/dashboard/stats` (simplest)
   - `/api/dashboard/activity`
   - `/api/dashboard/trending`
   - `/api/dashboard/watchlist`
   - `/api/dashboard/news`
   - `/api/dashboard` (combines all)

2. **Test** each endpoint with sample data

3. **Verify** response formats match this guide

4. **Connect** frontend by running `npm run dev`

5. **Monitor** Network tab to ensure data flows correctly

---

**Status**: Frontend ready for backend API integration ✅
**Next**: Implement backend endpoints according to this specification
