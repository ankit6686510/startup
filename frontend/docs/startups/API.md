# Startups Discovery - API Reference

Complete API specification for the Startups Discovery feature backend implementation.

## Base URL
```
https://api.startupcompass.com/api/startups
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Endpoints

### 1. Get Startups (List with Filters)

**GET** `/startups`

List all startups with pagination and filtering support.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (1-indexed) |
| `pageSize` | number | No | 12 | Items per page |
| `industries` | string[] | No | - | Filter by industries (comma-separated) |
| `fundingStages` | string[] | No | - | Filter by funding stages |
| `fundingMin` | number | No | - | Minimum funding amount (in dollars) |
| `fundingMax` | number | No | - | Maximum funding amount |
| `locations` | string[] | No | - | Filter by cities |
| `statuses` | string[] | No | - | Filter by status (ACTIVE, ACQUIRED, CLOSED, PIVOT) |
| `employeeRanges` | string[] | No | - | Filter by employee count ranges |
| `sortBy` | string | No | newest | Sort: newest, most_funded, most_followed |
| `search` | string | No | - | Search query (name, tagline, description) |

#### Example Request

```bash
curl -X GET 'https://api.startupcompass.com/api/startups?page=1&pageSize=12&industries=Tech,AI/ML&fundingStages=SERIES_A,SERIES_B&sortBy=most_funded' \
  -H 'Authorization: Bearer <TOKEN>'
```

#### Response (200 OK)

```json
{
  "items": [
    {
      "id": "startup-001",
      "name": "TechCorp",
      "tagline": "AI-powered solutions",
      "description": "We build AI tools for enterprises...",
      "logo": "https://cdn.example.com/logos/techcorp.png",
      "website": "https://techcorp.com",
      "founded": "2022-03-15T00:00:00Z",
      "fundingStage": "SERIES_B",
      "totalFunded": 25000000,
      "industry": "AI/ML",
      "location": {
        "city": "San Francisco",
        "country": "USA"
      },
      "employeeCount": 45,
      "status": "ACTIVE",
      "followersCount": 1250,
      "isFollowing": false,
      "isSaved": false
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 12,
  "totalPages": 13
}
```

#### Errors

| Status | Error | Description |
|--------|-------|-------------|
| 400 | INVALID_FILTER | Invalid filter parameter value |
| 401 | UNAUTHORIZED | Missing or invalid authentication token |
| 500 | SERVER_ERROR | Internal server error |

---

### 2. Get Startup Detail

**GET** `/startups/:id`

Get full details of a single startup including team, funding history, jobs, and news.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Startup ID |

#### Example Request

```bash
curl -X GET 'https://api.startupcompass.com/api/startups/startup-001' \
  -H 'Authorization: Bearer <TOKEN>'
```

#### Response (200 OK)

```json
{
  "id": "startup-001",
  "name": "TechCorp",
  "tagline": "AI-powered solutions",
  "description": "We build AI tools for enterprises...",
  "logo": "https://cdn.example.com/logos/techcorp.png",
  "website": "https://techcorp.com",
  "founded": "2022-03-15T00:00:00Z",
  "fundingStage": "SERIES_B",
  "totalFunded": 25000000,
  "industry": "AI/ML",
  "location": {
    "city": "San Francisco",
    "country": "USA"
  },
  "employeeCount": 45,
  "status": "ACTIVE",
  "followersCount": 1250,
  "isFollowing": false,
  "isSaved": false,
  "team": [
    {
      "id": "founder-001",
      "name": "John Doe",
      "role": "CEO",
      "bio": "Serial entrepreneur with 10+ years experience",
      "image": "https://cdn.example.com/avatars/john.jpg",
      "linkedIn": "https://linkedin.com/in/johndoe"
    }
  ],
  "fundingHistory": [
    {
      "stage": "SEED",
      "amount": 500000,
      "date": "2022-06-01T00:00:00Z",
      "investors": ["Y Combinator", "First Round Capital"]
    },
    {
      "stage": "SERIES_A",
      "amount": 5000000,
      "date": "2023-01-15T00:00:00Z",
      "investors": ["Sequoia Capital"]
    }
  ],
  "jobs": [
    {
      "id": "job-001",
      "title": "Senior Backend Engineer",
      "location": "San Francisco, CA",
      "type": "Full-time"
    }
  ],
  "news": [
    {
      "id": "news-001",
      "title": "TechCorp raises $15M Series B",
      "summary": "AI startup secures funding...",
      "source": "TechCrunch",
      "sourceUrl": "https://techcrunch.com/article",
      "publishedAt": "2024-01-10T00:00:00Z",
      "category": "FUNDING",
      "image": "https://cdn.example.com/images/news-001.jpg"
    }
  ]
}
```

#### Errors

| Status | Error | Description |
|--------|-------|-------------|
| 404 | NOT_FOUND | Startup not found |
| 401 | UNAUTHORIZED | Missing authentication |

---

### 3. Search Startups (Autocomplete)

**GET** `/startups/search`

Real-time search with autocomplete suggestions.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | - | Search term |
| `limit` | number | No | 5 | Max results |

#### Example Request

```bash
curl -X GET 'https://api.startupcompass.com/api/startups/search?query=tech&limit=10' \
  -H 'Authorization: Bearer <TOKEN>'
```

#### Response (200 OK)

```json
{
  "results": [
    {
      "id": "startup-001",
      "name": "TechCorp",
      "logo": "https://cdn.example.com/logos/techcorp.png",
      "tagline": "AI-powered solutions",
      "location": {
        "city": "San Francisco",
        "country": "USA"
      },
      "industry": "AI/ML"
    }
  ]
}
```

---

### 4. Get Trending Startups

**GET** `/startups/trending`

Get trending startups based on recent activity.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 10 | Max results |
| `timeframe` | string | No | week | Time range: week, month, quarter, year |

#### Example Request

```bash
curl -X GET 'https://api.startupcompass.com/api/startups/trending?limit=10&timeframe=week' \
  -H 'Authorization: Bearer <TOKEN>'
```

#### Response (200 OK)

```json
{
  "items": [
    {
      "id": "startup-001",
      "name": "TechCorp",
      "tagline": "AI-powered solutions",
      "logo": "https://cdn.example.com/logos/techcorp.png",
      "industry": "AI/ML",
      "trendScore": 95,
      "trendDirection": "up"
    }
  ]
}
```

---

### 5. Get Startups by Industry

**GET** `/startups/industry/:industry`

Get startups filtered by specific industry.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `industry` | string | Yes | Industry name |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 20 | Max results |
| `page` | number | No | 1 | Page number |

#### Example Request

```bash
curl -X GET 'https://api.startupcompass.com/api/startups/industry/AI%2FML?limit=20' \
  -H 'Authorization: Bearer <TOKEN>'
```

#### Response (200 OK)

```json
{
  "items": [
    {
      "id": "startup-001",
      "name": "TechCorp",
      "industry": "AI/ML",
      ...
    }
  ],
  "total": 85,
  "page": 1
}
```

---

### 6. Get Industry Statistics

**GET** `/startups/stats/industries`

Get statistics and analytics for all industries.

#### Example Request

```bash
curl -X GET 'https://api.startupcompass.com/api/startups/stats/industries' \
  -H 'Authorization: Bearer <TOKEN>'
```

#### Response (200 OK)

```json
{
  "industries": [
    {
      "name": "AI/ML",
      "count": 250,
      "avgFunding": 12500000,
      "totalFunding": 3125000000,
      "avgEmployees": 35,
      "growthRate": 45.5
    }
  ]
}
```

---

### 7. Compare Startups

**POST** `/startups/compare`

Get comparison data for multiple startups.

#### Request Body

```json
{
  "ids": ["startup-001", "startup-002", "startup-003"]
}
```

#### Validation

- Minimum 2 startups required
- Maximum 4 startups allowed

#### Example Request

```bash
curl -X POST 'https://api.startupcompass.com/api/startups/compare' \
  -H 'Authorization: Bearer <TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "ids": ["startup-001", "startup-002"]
  }'
```

#### Response (200 OK)

```json
[
  {
    "id": "startup-001",
    "name": "TechCorp",
    "fundingStage": "SERIES_B",
    "totalFunded": 25000000,
    "founded": "2022-03-15T00:00:00Z",
    "location": {"city": "San Francisco", "country": "USA"},
    "industry": "AI/ML",
    "followersCount": 1250,
    "employeeCount": 45,
    "status": "ACTIVE"
  }
]
```

#### Errors

| Status | Error | Description |
|--------|-------|-------------|
| 400 | INVALID_ID_COUNT | Not 2-4 IDs provided |
| 404 | STARTUP_NOT_FOUND | One or more startups not found |

---

### 8. Get Startup Jobs

**GET** `/startups/:id/jobs`

Get job listings for a specific startup.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Startup ID |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 10 | Max results |

#### Response (200 OK)

```json
{
  "items": [
    {
      "id": "job-001",
      "title": "Senior Backend Engineer",
      "location": "San Francisco, CA",
      "type": "Full-time",
      "level": "Senior",
      "salary": "$150,000 - $200,000"
    }
  ]
}
```

---

### 9. Get Startup News

**GET** `/startups/:id/news`

Get news articles and press mentions for a startup.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Startup ID |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 10 | Max results |

#### Response (200 OK)

```json
{
  "items": [
    {
      "id": "news-001",
      "title": "TechCorp raises $15M Series B",
      "summary": "AI startup secures funding from Sequoia Capital",
      "source": "TechCrunch",
      "sourceUrl": "https://techcrunch.com/article",
      "publishedAt": "2024-01-10T00:00:00Z",
      "category": "FUNDING",
      "image": "https://cdn.example.com/images/news-001.jpg"
    }
  ]
}
```

---

### 10. Get Related Startups

**GET** `/startups/:id/related`

Get similar startups (same industry or stage).

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Startup ID |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 5 | Max results |

#### Response (200 OK)

```json
{
  "items": [
    {
      "id": "startup-002",
      "name": "AIStartup",
      "tagline": "Machine learning platform",
      "logo": "https://cdn.example.com/logos/aistarup.png",
      "industry": "AI/ML",
      "fundingStage": "SERIES_B"
    }
  ]
}
```

---

### 11. Toggle Follow Startup

**POST** `/startups/:id/follow`

Follow or unfollow a startup.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Startup ID |

#### Request Body

```json
{
  "follow": true
}
```

#### Example Request

```bash
curl -X POST 'https://api.startupcompass.com/api/startups/startup-001/follow' \
  -H 'Authorization: Bearer <TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "follow": true
  }'
```

#### Response (200 OK)

```json
{
  "success": true,
  "isFollowing": true
}
```

---

### 12. Toggle Save Startup

**POST** `/startups/:id/save`

Save or remove a startup from watchlist.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Startup ID |

#### Request Body

```json
{
  "save": true
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "isSaved": true
}
```

---

### 13. Get Saved Startups

**GET** `/startups/saved`

Get user's saved/watchlisted startups.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `pageSize` | number | No | 12 | Items per page |

#### Response (200 OK)

```json
{
  "items": [
    {
      "id": "startup-001",
      "name": "TechCorp",
      ...
    }
  ],
  "total": 5,
  "page": 1,
  "pageSize": 12,
  "totalPages": 1
}
```

---

### 14. Get Suggested Startups

**GET** `/startups/suggested`

Get personalized startup recommendations for the user.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 10 | Max results |

#### Response (200 OK)

```json
{
  "items": [
    {
      "id": "startup-001",
      "name": "TechCorp",
      "confidenceScore": 0.95,
      ...
    }
  ]
}
```

---

## Data Types

### Startup

```typescript
{
  id: string;
  name: string;
  tagline: string;
  description: string;
  logo: string;
  website: string;
  founded: string; // ISO 8601
  fundingStage: string; // IDEA | SEED | SERIES_A-E | GROWTH | LATE_STAGE | PUBLIC
  totalFunded: number;
  industry: string;
  location: {
    city: string;
    country: string;
  };
  employeeCount: number;
  status: string; // ACTIVE | ACQUIRED | CLOSED | PIVOT
  followersCount: number;
  isFollowing: boolean;
  isSaved: boolean;
}
```

### Founder

```typescript
{
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedIn: string;
}
```

### FundingRound

```typescript
{
  stage: string;
  amount: number;
  date: string; // ISO 8601
  investors: string[];
}
```

### StartupJob

```typescript
{
  id: string;
  title: string;
  location: string;
  type: string;
}
```

### StartupNews

```typescript
{
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishedAt: string; // ISO 8601
  category: string;
  image: string;
}
```

---

## Error Responses

All errors return JSON with this format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_FILTER | 400 | Invalid filter parameter |
| INVALID_ID_COUNT | 400 | Invalid number of IDs (must be 2-4) |
| NOT_FOUND | 404 | Resource not found |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| SERVER_ERROR | 500 | Internal server error |

---

## Rate Limiting

- **Rate Limit**: 100 requests per minute per user
- **Header**: `X-RateLimit-Remaining`
- **Excess**: Returns 429 Too Many Requests

---

## Pagination

Standard pagination parameters applied to list endpoints:

```json
{
  "items": [...],
  "total": 150,           // Total items
  "page": 1,              // Current page (1-indexed)
  "pageSize": 12,         // Items per page
  "totalPages": 13        // Total number of pages
}
```

---

## Sorting

Supported sortBy values:
- `newest` - Newest first
- `most_funded` - Highest funding first
- `most_followed` - Most followers first
- `trending` - Based on recent activity

---

## Filtering

Multiple values for same filter are treated as OR:
```
?industries=Tech&industries=AI/ML  // Tech OR AI/ML
```

Multiple different filters are treated as AND:
```
?industries=Tech&fundingStages=SERIES_A  // Tech AND SERIES_A
```
