import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { StartupDiscoveryService } from '../services/StartupDiscoveryService';
import {
  SearchStartupsRequest,
  FollowStartupRequest,
  SearchResultsResponse,
  TrendingStartupsResponse,
  RecommendationsResponse,
  UserFollowsResponse,
  UserBookmarksResponse,
  FollowStatusResponse,
  DiscoveryPageResponse,
  ApiResponse,
} from '../types/startup-profiles.types';

@Controller('startups')
export class StartupDiscoveryController {
  private readonly logger = new Logger(StartupDiscoveryController.name);

  constructor(private discoveryService: StartupDiscoveryService) {}

  // ==================== SEARCH ENDPOINTS ====================

  @Get('search')
  async searchStartups(
    @Query() filters: SearchStartupsRequest,
  ): Promise<ApiResponse<SearchResultsResponse>> {
    this.logger.log(`Searching startups with filters: ${JSON.stringify(filters)}`);

    try {
      const results = await this.discoveryService.searchStartups(filters);
      return {
        success: true,
        data: results,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new BadRequestException(`Search failed: ${error.message}`);
    }
  }

  @Get('trending')
  async getTrendingStartups(
    @Query('limit') limit: number = 10,
    @Query('days') days: number = 7,
  ): Promise<ApiResponse<TrendingStartupsResponse>> {
    this.logger.log(`Getting trending startups for last ${days} days`);

    try {
      const results = await this.discoveryService.getTrendingStartups(limit, days);
      return {
        success: true,
        data: results,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch trending startups: ${error.message}`);
    }
  }

  @Get('discovery')
  async getDiscoveryPage(
    @Query('limit') limit: number = 20,
    @Headers('x-user-id') userId?: string,
  ): Promise<ApiResponse<DiscoveryPageResponse>> {
    this.logger.log(`Getting discovery page for user ${userId || 'anonymous'}`);

    try {
      const result = await this.discoveryService.getDiscoveryPage(userId, limit);
      return {
        success: true,
        data: result,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new BadRequestException(`Failed to load discovery page: ${error.message}`);
    }
  }

  @Get(':startupId/similar')
  async getSimilarStartups(
    @Param('startupId') startupId: string,
    @Query('limit') limit: number = 5,
  ): Promise<ApiResponse<RecommendationsResponse>> {
    this.logger.log(`Getting startups similar to ${startupId}`);

    try {
      const results = await this.discoveryService.getSimilarStartups(startupId, limit);
      return {
        success: true,
        data: {
          data: results.map((r) => ({
            startup: { id: r.startupId } as any,
            similarityScore: r.similarity,
            commonFactors: r.commonFactors,
          })),
          count: results.length,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  // ==================== RECOMMENDATIONS ====================

  @Get('recommendations')
  async getRecommendations(
    @Query('limit') limit: number = 10,
    @Headers('x-user-id') userId?: string,
  ): Promise<ApiResponse<RecommendationsResponse>> {
    this.logger.log(`Getting recommendations for user ${userId}`);

    if (!userId) {
      throw new BadRequestException('User ID is required for recommendations');
    }

    try {
      const results = await this.discoveryService.getRecommendations(userId, limit);
      return {
        success: true,
        data: results,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new BadRequestException(`Failed to generate recommendations: ${error.message}`);
    }
  }

  // ==================== FOLLOW ENDPOINTS ====================

  @Post(':startupId/follow')
  @HttpCode(HttpStatus.CREATED)
  async followStartup(
    @Param('startupId') startupId: string,
    @Body() request: FollowStartupRequest,
    @Headers('x-user-id') userId: string,
  ) {
    this.logger.log(`User ${userId} following startup ${startupId}`);

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const follow = await this.discoveryService.followStartup(userId, startupId, request.metadata);
      return {
        success: true,
        data: follow,
        message: 'Startup followed successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':startupId/follow')
  async unfollowStartup(
    @Param('startupId') startupId: string,
    @Headers('x-user-id') userId: string,
  ) {
    this.logger.log(`User ${userId} unfollowing startup ${startupId}`);

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      await this.discoveryService.unfollowStartup(userId, startupId);
      return {
        success: true,
        message: 'Startup unfollowed successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':startupId/follow/status')
  async getFollowStatus(
    @Param('startupId') startupId: string,
    @Headers('x-user-id') userId: string,
  ): Promise<ApiResponse<FollowStatusResponse>> {
    this.logger.log(`Checking follow status for user ${userId} and startup ${startupId}`);

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const isFollowing = await this.discoveryService.isFollowing(userId, startupId);
      const isBookmarked = await this.discoveryService.isBookmarked(userId, startupId);

      return {
        success: true,
        data: {
          isFollowing,
          isBookmarked,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ==================== BOOKMARK ENDPOINTS ====================

  @Post(':startupId/bookmark')
  @HttpCode(HttpStatus.CREATED)
  async bookmarkStartup(
    @Param('startupId') startupId: string,
    @Headers('x-user-id') userId: string,
  ) {
    this.logger.log(`User ${userId} bookmarking startup ${startupId}`);

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const bookmark = await this.discoveryService.bookmarkStartup(userId, startupId);
      return {
        success: true,
        data: bookmark,
        message: 'Startup bookmarked successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':startupId/bookmark')
  async removeBookmark(
    @Param('startupId') startupId: string,
    @Headers('x-user-id') userId: string,
  ) {
    this.logger.log(`User ${userId} removing bookmark for startup ${startupId}`);

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      await this.discoveryService.removeBookmark(userId, startupId);
      return {
        success: true,
        message: 'Bookmark removed successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ==================== USER LISTS ENDPOINTS ====================

  @Get('user/:userId/follows')
  async getUserFollows(
    @Param('userId') userId: string,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
    @Headers('x-user-id') requesterId: string,
  ): Promise<ApiResponse<UserFollowsResponse>> {
    this.logger.log(`Getting follows for user ${userId}`);

    // Users can only see their own follows unless public profile is enabled
    if (userId !== requesterId) {
      throw new BadRequestException('You can only view your own follows');
    }

    try {
      const follows = await this.discoveryService.getUserFollows(userId, limit, offset);
      return {
        success: true,
        data: follows as any,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('user/:userId/bookmarks')
  async getUserBookmarks(
    @Param('userId') userId: string,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
    @Headers('x-user-id') requesterId: string,
  ): Promise<ApiResponse<UserBookmarksResponse>> {
    this.logger.log(`Getting bookmarks for user ${userId}`);

    // Users can only see their own bookmarks
    if (userId !== requesterId) {
      throw new BadRequestException('You can only view your own bookmarks');
    }

    try {
      const bookmarks = await this.discoveryService.getUserBookmarks(userId, limit, offset);
      return {
        success: true,
        data: bookmarks as any,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ==================== ANALYTICS ENDPOINTS ====================

  @Get(':startupId/followers/count')
  async getFollowersCount(@Param('startupId') startupId: string) {
    this.logger.log(`Getting followers count for startup ${startupId}`);

    try {
      const count = await this.discoveryService.getFollowersCount(startupId);
      return {
        success: true,
        data: { count },
        timestamp: new Date(),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':startupId/followers/top')
  async getTopFollowers(@Param('startupId') startupId: string, @Query('limit') limit: number = 10) {
    this.logger.log(`Getting top followers for startup ${startupId}`);

    try {
      const followers = await this.discoveryService.getTopFollowers(startupId, limit);
      return {
        success: true,
        data: followers,
        count: followers.length,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':startupId/trending-score')
  async getTrendingScore(@Param('startupId') startupId: string) {
    this.logger.log(`Calculating trending score for startup ${startupId}`);

    try {
      const score = await this.discoveryService.calculateTrendingScore(startupId);
      return {
        success: true,
        data: { trendingScore: score },
        timestamp: new Date(),
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  // ==================== ANALYTICS TRACKING ====================

  @Post(':startupId/track/:action')
  async trackAction(
    @Param('startupId') startupId: string,
    @Param('action') action: 'view' | 'search' | 'recommend',
    @Headers('x-user-id') userId?: string,
  ) {
    this.logger.log(`Tracking ${action} action for startup ${startupId} by user ${userId}`);

    try {
      const result = await this.discoveryService.trackDiscoveryAction(startupId, action, userId);
      return {
        success: true,
        data: result,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ==================== FILTER OPTIONS ====================

  @Get('filters/options')
  async getFilterOptions() {
    this.logger.log('Getting available filter options');

    const options = {
      industries: [
        { label: 'Technology', value: 'technology' },
        { label: 'Healthcare', value: 'healthcare' },
        { label: 'Finance', value: 'finance' },
        { label: 'Education', value: 'education' },
        { label: 'E-commerce', value: 'ecommerce' },
        { label: 'SaaS', value: 'saas' },
        { label: 'AI/ML', value: 'ai-ml' },
        { label: 'Blockchain', value: 'blockchain' },
      ],
      stages: [
        { label: 'Idea', value: 'idea' },
        { label: 'Pre-Seed', value: 'pre-seed' },
        { label: 'Seed', value: 'seed' },
        { label: 'Series A', value: 'series-a' },
        { label: 'Series B', value: 'series-b' },
        { label: 'Series C', value: 'series-c' },
        { label: 'Series D+', value: 'series-d' },
        { label: 'Growth', value: 'growth' },
      ],
      locations: [
        { label: 'San Francisco Bay Area', value: 'sf-bay' },
        { label: 'New York', value: 'ny' },
        { label: 'Los Angeles', value: 'la' },
        { label: 'Seattle', value: 'seattle' },
        { label: 'Austin', value: 'austin' },
        { label: 'Boston', value: 'boston' },
        { label: 'London', value: 'london' },
        { label: 'Singapore', value: 'singapore' },
        { label: 'India', value: 'india' },
      ],
      fundingRanges: [
        { label: 'Under $100K', min: 0, max: 100000 },
        { label: '$100K - $1M', min: 100000, max: 1000000 },
        { label: '$1M - $5M', min: 1000000, max: 5000000 },
        { label: '$5M - $10M', min: 5000000, max: 10000000 },
        { label: '$10M - $50M', min: 10000000, max: 50000000 },
        { label: '$50M+', min: 50000000, max: 999999999 },
      ],
      sortOptions: [
        { label: 'Trending', value: 'trending' },
        { label: 'Most Followers', value: 'followers' },
        { label: 'Most Recent', value: 'recent' },
        { label: 'Relevance', value: 'relevance' },
      ],
    };

    return {
      success: true,
      data: options,
      timestamp: new Date(),
    };
  }
}
