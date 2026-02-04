# Startup Profiles & Discovery - Quick Reference Guide

## 🚀 5-Minute Setup Checklist

### Step 1: Copy Implementation Files
```bash
# All in services/startup-service/src/

# Models (4 new files)
- models/StartupTeam.ts (113 lines)
- models/StartupPhoto.ts (101 lines)
- models/StartupVerification.ts (156 lines)
- models/StartupFollow.ts (92 lines)

# Services (2 new files)
- services/StartupProfileService.ts (660 lines)
- services/StartupDiscoveryService.ts (585 lines)

# Controllers (2 new files)
- controllers/StartupProfileController.ts (594 lines)
- controllers/StartupDiscoveryController.ts (462 lines)

# Types (1 new file)
- types/startup-profiles.types.ts (469 lines)
```

### Step 2: Update Module Registration

Edit `startup.module.ts`:

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';
import { StartupTeam } from './models/StartupTeam';
import { StartupPhoto } from './models/StartupPhoto';
import { StartupVerification } from './models/StartupVerification';
import { StartupFollow } from './models/StartupFollow';
import { StartupProfileService } from './services/StartupProfileService';
import { StartupDiscoveryService } from './services/StartupDiscoveryService';
import { StartupProfileController } from './controllers/StartupProfileController';
import { StartupDiscoveryController } from './controllers/StartupDiscoveryController';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Startup,
      StartupTeam,      // NEW
      StartupPhoto,     // NEW
      StartupVerification, // NEW
      StartupFollow,    // NEW
      // ... existing entities
    ])
  ],
  providers: [
    StartupProfileService,    // NEW
    StartupDiscoveryService,  // NEW
    // ... existing services
  ],
  controllers: [
    StartupProfileController,   // NEW
    StartupDiscoveryController, // NEW
    // ... existing controllers
  ],
  exports: [
    StartupProfileService,
    StartupDiscoveryService
  ]
})
export class StartupModule {}
```

### Step 3: Create Database Migration

```bash
cd services/startup-service
npm run typeorm migration:generate -- -n AddStartupProfiles
npm run typeorm migration:run
```

### Step 4: Update Startup Entity

Add to `models/Startup.ts`:

```typescript
@OneToMany(() => StartupTeam, team => team.startup)
teamMembers: StartupTeam[];

@OneToMany(() => StartupPhoto, photo => photo.startup)
photos: StartupPhoto[];

@OneToOne(() => StartupVerification, verification => verification.startup)
verification: StartupVerification;

@OneToMany(() => StartupFollow, follow => follow.startup)
followers: StartupFollow[];
```

### Step 5: Test

```bash
npm run test
npm run start:dev
```

---

## 📚 Documentation Files

| File | Lines | Purpose |
|------|-------|---------|
| `startup-profiles-discovery-api.md` | 990 | Complete API reference |
| `STARTUP_PROFILES_IMPLEMENTATION_GUIDE.md` | 639 | Integration instructions |
| `STARTUP_PROFILES_DISCOVERY_SUMMARY.md` | 494 | Project summary |
| `postman-startup-profiles-discovery.json` | 300+ | Postman collection |

---

## 🔑 Key Service Methods Quick Reference

### StartupProfileService

**Profile**
```typescript
getCompleteProfile(startupId: string)
updateProfile(startupId: string, updateData)
calculateProfileCompleteness(startup, team, photos): number
getProfileAnalytics(startupId)
getFeaturedContent(startupId)
```

**Team**
```typescript
addTeamMember(startupId: string, memberData)
updateTeamMember(startupId: string, memberId: string, updateData)
deleteTeamMember(startupId: string, memberId: string)
reorderTeam(startupId: string, memberIds: string[])
getTeamMembers(startupId: string)
```

**Photos**
```typescript
addPhoto(startupId: string, photoData)
updatePhoto(startupId: string, photoId: string, updateData)
deletePhoto(startupId: string, photoId: string)
reorderPhotos(startupId: string, photoIds: string[])
getGallery(startupId: string, category?: string)
incrementPhotoViews(photoId: string)
togglePhotoLike(photoId: string, like: boolean)
```

**Verification**
```typescript
getOrCreateVerification(startupId: string)
startEmailVerification(startupId: string, email: string)
confirmEmailVerification(startupId: string)
submitDocuments(startupId: string, registrationNumber, documentUrl)
approveVerification(startupId: string, reviewedBy, notes?)
rejectVerification(startupId: string, reviewedBy, reason)
getVerificationStatus(startupId: string)
```

### StartupDiscoveryService

**Search**
```typescript
searchStartups(filters: SearchFilters)
getTrendingStartups(limit: number = 10, days: number = 7)
calculateTrendingScore(startupId: string): number
```

**Recommendations**
```typescript
getRecommendations(userId: string, limit: number = 10)
getSimilarStartups(startupId: string, limit: number = 5)
getDiscoveryPage(userId?: string, limit: number = 20)
```

**Follow & Bookmark**
```typescript
followStartup(userId: string, startupId: string, metadata?)
unfollowStartup(userId: string, startupId: string)
bookmarkStartup(userId: string, startupId: string)
removeBookmark(userId: string, startupId: string)
isFollowing(userId: string, startupId: string): boolean
isBookmarked(userId: string, startupId: string): boolean
getUserFollows(userId: string, limit: number, offset: number)
getUserBookmarks(userId: string, limit: number, offset: number)
```

**Analytics**
```typescript
getFollowersCount(startupId: string): number
getTopFollowers(startupId: string, limit: number)
trackDiscoveryAction(startupId, action, userId?)
```

---

## 🔌 Most Popular API Endpoints

### Profile
```
GET  /startups/:startupId/profile
PUT  /startups/:startupId/profile
GET  /startups/:startupId/profile/analytics
```

### Team
```
GET  /startups/:startupId/profile/team
POST /startups/:startupId/profile/team
PUT  /startups/:startupId/profile/team/:memberId
```

### Gallery
```
GET  /startups/:startupId/profile/gallery
POST /startups/:startupId/profile/gallery
POST /startups/:startupId/profile/gallery/:photoId/like
```

### Verification
```
GET  /startups/:startupId/profile/verification
POST /startups/:startupId/profile/verification/email
POST /startups/:startupId/profile/verification/documents
```

### Search & Discover
```
GET  /startups/search?keyword=...&industry=...
GET  /startups/trending
GET  /startups/discovery
GET  /startups/recommendations
```

### Follow & Bookmark
```
POST   /startups/:startupId/follow
DELETE /startups/:startupId/follow
POST   /startups/:startupId/bookmark
GET    /startups/user/:userId/follows
GET    /startups/user/:userId/bookmarks
```

---

## 🧪 Testing Examples

### Using cURL

**Get Profile**
```bash
curl http://localhost:3001/api/startups/UUID/profile
```

**Add Team Member**
```bash
curl -X POST http://localhost:3001/api/startups/UUID/profile/team \
  -H "x-user-id: USER_UUID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "title": "CTO",
    "role": "CTO",
    "email": "john@startup.com"
  }'
```

**Search Startups**
```bash
curl "http://localhost:3001/api/startups/search?keyword=AI&industry=technology&limit=20"
```

**Follow Startup**
```bash
curl -X POST http://localhost:3001/api/startups/UUID/follow \
  -H "x-user-id: USER_UUID"
```

### Using Postman

1. Import `postman-startup-profiles-discovery.json`
2. Set environment variables:
   - `baseUrl`: http://localhost:3001/api
   - `startupId`: your startup UUID
   - `userId`: your user UUID
3. Run requests from pre-configured collection

---

## 📊 Database Schema Summary

### StartupTeam
- 18 team role types
- Social links (LinkedIn, Twitter, GitHub)
- Expertise and education arrays
- Views tracking
- Featured flag and order index

### StartupPhoto
- 7 photo categories
- S3 storage (image + thumbnail)
- Image metadata (width, height, MIME type, file size)
- Engagement (views, likes)
- Soft delete support
- Featured flag and order index

### StartupVerification
- 5 status types (Unverified, Pending, Verified, Rejected, Suspended)
- Email verification workflow
- Document submission tracking
- Admin review with notes
- Rejection tracking with resubmission rules

### StartupFollow
- User-startup relationships
- Notification preferences (all, major, none)
- Bookmark flag
- User tags and notes
- Unique constraint on (userId, startupId)

---

## 🔒 Security Checklist

- [x] All write operations require `x-user-id` header
- [x] Users can only modify their own startup
- [x] Admin endpoints for verification approve/reject
- [x] Input validation on all endpoints
- [x] S3 URL validation for images
- [x] Soft delete for data recovery
- [x] Error handling without data exposure
- [x] Rate limiting support
- [x] Transaction support for multi-step operations

---

## 🚨 Common Issues & Solutions

### Issue: Relations not loading
**Solution**: Add `relations` parameter to `findOne`:
```typescript
const startup = await startupRepository.findOne({
  where: { id },
  relations: ['teamMembers', 'photos', 'verification']
});
```

### Issue: Soft deleted photos showing up
**Solution**: Filter in queries:
```typescript
where: { startupId, deletedAt: null }
```

### Issue: Order not maintained
**Solution**: Always include `order` parameter:
```typescript
order: { orderIndex: 'ASC' }
```

### Issue: Performance with large galleries
**Solution**: Use pagination with `take` and `skip`:
```typescript
.take(20).skip(offset)
```

---

## 📈 Performance Tips

1. **Indexes**: Models include indexes on frequently queried columns
2. **Pagination**: Always use limit/offset for large datasets
3. **Eager Loading**: Use relations to avoid N+1 queries
4. **Caching**: Cache trending and discovery pages (30-60 min TTL)
5. **S3**: Use CloudFront for image delivery
6. **Database**: Add indexes on `created_at` for date range queries

---

## 🔄 Data Flow Examples

### Profile Creation Flow
```
1. Startup sign up (already exists)
2. Update profile info (PUT /profile)
3. Add team members (POST /profile/team)
4. Upload photos (POST /profile/gallery)
5. Start email verification (POST /profile/verification/email)
6. Submit documents (POST /profile/verification/documents)
7. Admin approves (POST /profile/verification/approve)
8. Profile visible in search
```

### Follow Flow
```
1. User searches startups (GET /search)
2. User views startup profile (GET /profile)
3. User clicks follow (POST /:startupId/follow)
4. Startup appears in user's follows (GET /user/:userId/follows)
5. User gets notifications (configurable)
```

### Recommendation Flow
```
1. User follows 3 AI startups
2. System finds similar startups
3. Recommends startups with:
   - Same industry (40% weight)
   - Same stage (30% weight)
   - Same location (20% weight)
   - Similar funding (10% weight)
4. Returns recommendations (GET /recommendations)
```

---

## 📞 Support Resources

- **API Docs**: See `startup-profiles-discovery-api.md`
- **Implementation Guide**: See `STARTUP_PROFILES_IMPLEMENTATION_GUIDE.md`
- **Project Summary**: See `STARTUP_PROFILES_DISCOVERY_SUMMARY.md`
- **Postman Collection**: Import `postman-startup-profiles-discovery.json`

---

## 📊 Code Statistics

| Category | Count |
|----------|-------|
| Database Models | 5 new |
| Service Methods | 50+ |
| API Endpoints | 30+ |
| Type Definitions | 30+ |
| Lines of Code | 3,232 |
| Documentation | 2,123 lines |
| Postman Requests | 30+ |

---

## ✅ Implementation Checklist

- [ ] Copy all 9 implementation files
- [ ] Update startup.module.ts
- [ ] Run database migrations
- [ ] Update Startup entity with new relations
- [ ] Test endpoints with Postman
- [ ] Review API documentation
- [ ] Configure notification preferences
- [ ] Set up S3 bucket for images
- [ ] Enable verification workflow (admin)
- [ ] Deploy to staging
- [ ] Gather user feedback
- [ ] Deploy to production

---

## 🎯 Next Steps

1. **Immediate**: Copy files and run migrations
2. **Short-term**: Test all endpoints with Postman
3. **Medium-term**: Integrate with frontend
4. **Long-term**: Add webhooks, advanced analytics, ML recommendations

Good luck! 🚀

