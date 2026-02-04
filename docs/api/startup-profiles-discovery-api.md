# Startup Profiles & Discovery API Documentation

## Overview

The Startup Profiles & Discovery API provides comprehensive endpoints for managing startup profiles, team information, photo galleries, verification workflows, and discovering startups through advanced search and recommendations.

**Service**: Startup Service  
**Port**: 3001  
**Base URL**: `http://localhost:3001/api`

---

## Table of Contents

1. [Profile Management](#profile-management)
2. [Team Management](#team-management)
3. [Photo Gallery](#photo-gallery)
4. [Verification](#verification)
5. [Search & Discovery](#search--discovery)
6. [Follow & Bookmark](#follow--bookmark)
7. [Analytics](#analytics)
8. [Response Format](#response-format)

---

## Profile Management

### Get Complete Startup Profile

Retrieve full startup profile including team, photos, and verification status.

**Endpoint**: `GET /startups/:startupId/profile`

**Parameters**:
- `startupId` (path, required): Startup UUID

**Response**:
```json
{
  "success": true,
  "data": {
    "startup": {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "longDescription": "string",
      "mission": "string",
      "vision": "string",
      "values": ["string"],
      "industry": "string",
      "fundingStage": "string",
      "totalFunding": 1000000,
      "website": "string",
      "foundingDate": "2023-01-01"
    },
    "teamMembers": [...],
    "photos": [...],
    "followers": 150,
    "profileCompleteness": 85,
    "verification": {...}
  }
}
```

---

### Update Startup Profile

Update startup information and settings.

**Endpoint**: `PUT /startups/:startupId/profile`

**Headers**:
- `x-user-id` (required): User UUID

**Request Body**:
```json
{
  "description": "string",
  "longDescription": "string",
  "mission": "string",
  "vision": "string",
  "values": ["string"],
  "website": "string",
  "linkedinUrl": "string",
  "twitterUrl": "string",
  "facebookUrl": "string",
  "instagramUrl": "string",
  "culture": "string",
  "foundingDate": "2023-01-01",
  "headquarters": "string",
  "companySize": "string"
}
```

**Response**: Updated startup object

---

### Get Profile Completion Status

Get profile completeness percentage and missing items.

**Endpoint**: `GET /startups/:startupId/profile/completion`

**Response**:
```json
{
  "success": true,
  "data": {
    "completionPercentage": 85,
    "missingItems": ["At least 5 photos", "LinkedIn URL"],
    "nextSteps": [
      "Upload company photos",
      "Add company social links"
    ]
  }
}
```

---

### Get Profile Analytics

Get profile engagement and performance metrics.

**Endpoint**: `GET /startups/:startupId/profile/analytics`

**Response**:
```json
{
  "success": true,
  "data": {
    "teamMembersCount": 5,
    "photosCount": 12,
    "followers": 250,
    "totalPhotoViews": 1500,
    "totalPhotoLikes": 450,
    "totalTeamViews": 800,
    "averagePhotoLikes": 37.5,
    "mostViewedPhoto": {...}
  }
}
```

---

### Get Featured Content

Get featured team members and photos.

**Endpoint**: `GET /startups/:startupId/profile/featured-content`

**Response**:
```json
{
  "success": true,
  "data": {
    "featuredTeamMembers": [...],
    "featuredPhotos": [...]
  }
}
```

---

## Team Management

### Get Team Members

Retrieve all team members for a startup.

**Endpoint**: `GET /startups/:startupId/profile/team`

**Query Parameters**:
- `orderBy` (optional): Field to order by (default: order_index)
- `limit` (optional): Number of results (default: 50)

**Response**:
```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

---

### Add Team Member

Add a new team member to startup.

**Endpoint**: `POST /startups/:startupId/profile/team`

**Headers**:
- `x-user-id` (required): User UUID

**Request Body**:
```json
{
  "name": "John Doe",
  "title": "Chief Technology Officer",
  "role": "CTO",
  "bio": "10+ years of experience in cloud infrastructure",
  "email": "john@startup.com",
  "phone": "+1-555-0100",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "twitterUrl": "https://twitter.com/johndoe",
  "githubUrl": "https://github.com/johndoe",
  "profileImageUrl": "s3://bucket/profile.jpg",
  "expertise": ["Cloud Computing", "DevOps", "Kubernetes"],
  "education": ["BS Computer Science", "MBA Stanford"]
}
```

**Response**: Created team member object

---

### Update Team Member

Update team member details.

**Endpoint**: `PUT /startups/:startupId/profile/team/:memberId`

**Headers**:
- `x-user-id` (required): User UUID

**Request Body**: Same as Add Team Member (all fields optional)

---

### Delete Team Member

Remove a team member.

**Endpoint**: `DELETE /startups/:startupId/profile/team/:memberId`

**Headers**:
- `x-user-id` (required): User UUID

**Response**:
```json
{
  "success": true,
  "message": "Team member deleted successfully"
}
```

---

### Reorder Team

Update team member display order.

**Endpoint**: `POST /startups/:startupId/profile/team/reorder`

**Headers**:
- `x-user-id` (required): User UUID

**Request Body**:
```json
{
  "memberIds": ["uuid1", "uuid2", "uuid3"]
}
```

---

## Photo Gallery

### Get Gallery

Retrieve startup photo gallery.

**Endpoint**: `GET /startups/:startupId/profile/gallery`

**Query Parameters**:
- `category` (optional): Filter by category (OFFICE, TEAM, PRODUCT, EVENT, CULTURE, ACHIEVEMENT, OTHER)

**Response**:
```json
{
  "success": true,
  "data": [...],
  "count": 12
}
```

---

### Add Photo

Upload a new photo to gallery.

**Endpoint**: `POST /startups/:startupId/profile/gallery`

**Headers**:
- `x-user-id` (required): User UUID

**Request Body**:
```json
{
  "title": "Team Photo at Conference",
  "caption": "Team at TechCrunch Disrupt 2023",
  "category": "TEAM",
  "imageUrl": "s3://bucket/photo.jpg",
  "thumbnailUrl": "s3://bucket/photo-thumb.jpg",
  "altText": "Team standing together at conference",
  "width": 1920,
  "height": 1080,
  "mimeType": "image/jpeg",
  "fileSize": 2048576
}
```

---

### Update Photo

Modify photo details.

**Endpoint**: `PUT /startups/:startupId/profile/gallery/:photoId`

**Headers**:
- `x-user-id` (required): User UUID

**Request Body**: Partial photo details (all fields optional)

---

### Delete Photo

Remove a photo (soft delete).

**Endpoint**: `DELETE /startups/:startupId/profile/gallery/:photoId`

**Headers**:
- `x-user-id` (required): User UUID

---

### Reorder Gallery

Update photo display order.

**Endpoint**: `POST /startups/:startupId/profile/gallery/reorder`

**Headers**:
- `x-user-id` (required): User UUID

**Request Body**:
```json
{
  "photoIds": ["uuid1", "uuid2", "uuid3"]
}
```

---

### Like Photo

Like a photo (increment likes count).

**Endpoint**: `POST /startups/:startupId/profile/gallery/:photoId/like`

**Headers**:
- `x-user-id` (required): User UUID

---

### Unlike Photo

Unlike a photo (decrement likes count).

**Endpoint**: `POST /startups/:startupId/profile/gallery/:photoId/unlike`

**Headers**:
- `x-user-id` (required): User UUID

---

## Verification

### Get Verification Status

Check current verification status of startup.

**Endpoint**: `GET /startups/:startupId/profile/verification`

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "PENDING",
    "emailVerified": true,
    "documentsVerified": false,
    "linkedinVerified": false,
    "reviewedAt": "2023-06-15T10:30:00Z",
    "rejectionReason": null,
    "canResubmit": true
  }
}
```

**Status Values**: `UNVERIFIED`, `PENDING`, `VERIFIED`, `REJECTED`, `SUSPENDED`

---

### Start Email Verification

Begin company email verification process.

**Endpoint**: `POST /startups/:startupId/profile/verification/email`

**Headers**:
- `x-user-id` (required): User UUID

**Request Body**:
```json
{
  "email": "admin@company.com"
}
```

**Response**: Verification record with pending status

---

### Confirm Email Verification

Confirm email verification (called after user confirms link in email).

**Endpoint**: `POST /startups/:startupId/profile/verification/email/confirm`

**Headers**:
- `x-user-id` (required): User UUID

---

### Submit Documents

Submit company registration documents for verification.

**Endpoint**: `POST /startups/:startupId/profile/verification/documents`

**Headers**:
- `x-user-id` (required): User UUID

**Request Body**:
```json
{
  "registrationNumber": "C12345678",
  "documentUrl": "s3://bucket/registration.pdf"
}
```

---

### Approve Verification (Admin)

Admin endpoint to approve startup verification.

**Endpoint**: `POST /startups/:startupId/profile/verification/approve`

**Headers**:
- `x-user-id` (required): Admin user UUID

**Request Body**:
```json
{
  "notes": "Documentation verified successfully"
}
```

---

### Reject Verification (Admin)

Admin endpoint to reject verification.

**Endpoint**: `POST /startups/:startupId/profile/verification/reject`

**Headers**:
- `x-user-id` (required): Admin user UUID

**Request Body**:
```json
{
  "reason": "Registration documents unclear. Please resubmit with certified copies."
}
```

---

## Search & Discovery

### Search Startups

Advanced search with multiple filters.

**Endpoint**: `GET /startups/search`

**Query Parameters**:
```
?keyword=string
&industry=tech,healthcare
&stage=seed,series-a
&location=san-francisco,new-york
&fundingMin=100000
&fundingMax=10000000
&employeeMin=1
&employeeMax=100
&foundedAfter=2020-01-01
&foundedBefore=2023-12-31
&hasVerification=true
&sortBy=trending|followers|recent|relevance
&limit=20
&offset=0
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Startup Name",
      "description": "string",
      "industry": "string",
      "fundingStage": "string",
      "totalFunding": 5000000,
      "headquarters": "string",
      "followers": 350,
      "verified": true,
      "foundingDate": "2021-06-15"
    }
  ],
  "pagination": {
    "total": 245,
    "limit": 20,
    "offset": 0,
    "pages": 13
  }
}
```

---

### Get Trending Startups

Get currently trending startups.

**Endpoint**: `GET /startups/trending`

**Query Parameters**:
- `limit` (optional): Max results (default: 10)
- `days` (optional): Time period (default: 7)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "industry": "string",
      "fundingStage": "string",
      "trendingScore": 850,
      "newFollowersLast7Days": 125,
      "photoViewsIncrease": 450,
      "photoLikesIncrease": 180
    }
  ],
  "period": "Last 7 days"
}
```

---

### Get Discovery Page

Get curated discovery page with trending and recommended startups.

**Endpoint**: `GET /startups/discovery`

**Headers**:
- `x-user-id` (optional): User UUID for personalized recommendations

**Query Parameters**:
- `limit` (optional): Results per section (default: 20)

**Response**:
```json
{
  "success": true,
  "data": {
    "trending": [...],
    "recommended": [...],
    "featured": [...],
    "sections": ["trending", "recommended", "featured"]
  }
}
```

---

### Get Similar Startups

Find startups similar to a given startup.

**Endpoint**: `GET /startups/:startupId/similar`

**Query Parameters**:
- `limit` (optional): Max results (default: 5)

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "startup": {...},
        "similarityScore": 85,
        "commonFactors": ["same-industry", "same-stage", "similar-funding"]
      }
    ],
    "count": 3
  }
}
```

---

### Get Recommendations

Get personalized startup recommendations for a user.

**Endpoint**: `GET /startups/recommendations`

**Headers**:
- `x-user-id` (required): User UUID

**Query Parameters**:
- `limit` (optional): Max results (default: 10)

**Response**: Same as Get Similar Startups

---

### Get Filter Options

Get available search filter options.

**Endpoint**: `GET /startups/filters/options`

**Response**:
```json
{
  "success": true,
  "data": {
    "industries": [
      { "label": "Technology", "value": "technology" },
      { "label": "Healthcare", "value": "healthcare" }
    ],
    "stages": [
      { "label": "Seed", "value": "seed" },
      { "label": "Series A", "value": "series-a" }
    ],
    "locations": [...],
    "fundingRanges": [...],
    "sortOptions": [...]
  }
}
```

---

## Follow & Bookmark

### Follow Startup

Follow a startup for updates.

**Endpoint**: `POST /startups/:startupId/follow`

**Headers**:
- `x-user-id` (required): User UUID

**Request Body**:
```json
{
  "metadata": {
    "followedFrom": "search"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "startupId": "uuid",
    "isBookmarked": false,
    "notificationPreferences": "all",
    "followedAt": "2023-06-15T10:30:00Z"
  },
  "message": "Startup followed successfully"
}
```

---

### Unfollow Startup

Stop following a startup.

**Endpoint**: `DELETE /startups/:startupId/follow`

**Headers**:
- `x-user-id` (required): User UUID

---

### Get Follow Status

Check if user is following and bookmarked.

**Endpoint**: `GET /startups/:startupId/follow/status`

**Headers**:
- `x-user-id` (required): User UUID

**Response**:
```json
{
  "success": true,
  "data": {
    "isFollowing": true,
    "isBookmarked": true,
    "notificationPreferences": "major",
    "followedAt": "2023-06-15T10:30:00Z"
  }
}
```

---

### Bookmark Startup

Bookmark a startup for later.

**Endpoint**: `POST /startups/:startupId/bookmark`

**Headers**:
- `x-user-id` (required): User UUID

---

### Remove Bookmark

Remove a startup from bookmarks.

**Endpoint**: `DELETE /startups/:startupId/bookmark`

**Headers**:
- `x-user-id` (required): User UUID

---

### Get User Follows

Get list of startups followed by user.

**Endpoint**: `GET /startups/user/:userId/follows`

**Headers**:
- `x-user-id` (required): User UUID (must match :userId)

**Query Parameters**:
- `limit` (optional): Max results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

---

### Get User Bookmarks

Get list of user's bookmarked startups.

**Endpoint**: `GET /startups/user/:userId/bookmarks`

**Headers**:
- `x-user-id` (required): User UUID (must match :userId)

**Query Parameters**:
- `limit` (optional): Max results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

---

## Analytics

### Get Followers Count

Get total followers for a startup.

**Endpoint**: `GET /startups/:startupId/followers/count`

**Response**:
```json
{
  "success": true,
  "data": {
    "count": 350
  }
}
```

---

### Get Top Followers

Get most recent followers of a startup.

**Endpoint**: `GET /startups/:startupId/followers/top`

**Query Parameters**:
- `limit` (optional): Max results (default: 10)

---

### Get Trending Score

Calculate trending score for a startup.

**Endpoint**: `GET /startups/:startupId/trending-score`

**Response**:
```json
{
  "success": true,
  "data": {
    "trendingScore": 850
  }
}
```

---

### Track Discovery Action

Track user actions in discovery (view, search, recommend).

**Endpoint**: `POST /startups/:startupId/track/:action`

**Headers**:
- `x-user-id` (optional): User UUID

**Parameters**:
- `action`: `view`, `search`, or `recommend`

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {...},
  "message": "string (optional)",
  "timestamp": "2023-06-15T10:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {...}
  },
  "timestamp": "2023-06-15T10:30:00Z"
}
```

### Common Error Codes

- `BAD_REQUEST`: Invalid request parameters
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `CONFLICT`: Resource already exists
- `INTERNAL_ERROR`: Server error

---

## Authentication

All endpoints require the `x-user-id` header for authentication (except search/discovery endpoints).

```
Headers:
  x-user-id: <user-uuid>
```

---

## Rate Limiting

- Search: 100 requests/minute
- Follow/Unfollow: 50 requests/minute
- Profile Updates: 30 requests/minute

---

## Examples

### Complete Search Example

```bash
curl -X GET "http://localhost:3001/api/startups/search?keyword=AI&industry=technology&stage=seed,series-a&location=san-francisco&fundingMin=1000000&fundingMax=10000000&hasVerification=true&sortBy=trending&limit=20&offset=0"
```

### Follow a Startup

```bash
curl -X POST "http://localhost:3001/api/startups/{startupId}/follow" \
  -H "x-user-id: {userId}" \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "followedFrom": "discovery"
    }
  }'
```

### Add Team Member

```bash
curl -X POST "http://localhost:3001/api/startups/{startupId}/profile/team" \
  -H "x-user-id: {userId}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "title": "VP Engineering",
    "role": "VP_ENGINEERING",
    "bio": "15 years building scalable systems",
    "email": "jane@startup.com",
    "linkedinUrl": "https://linkedin.com/in/janesmith",
    "expertise": ["Distributed Systems", "Golang", "Kubernetes"]
  }'
```

---

## Best Practices

1. **Search**: Use filters to narrow results and improve performance
2. **Pagination**: Always use limit and offset for list endpoints
3. **Verification**: Encourage startups to complete email verification first
4. **Images**: Optimize images before uploading (compress to < 2MB)
5. **Updates**: Batch updates when possible to reduce API calls
6. **Caching**: Cache trending and discovery data client-side (30-60 min TTL)

---

## Webhooks (Future)

Planned webhook events:
- `startup.verified`: Startup verification approved
- `startup.profile.updated`: Profile information updated
- `startup.team.added`: Team member added
- `startup.photo.added`: Photo uploaded
- `startup.followed`: New follower
- `startup.mentioned`: Mentioned in search results/trending

