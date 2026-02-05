import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between, In } from 'typeorm';
import { Startup } from '../models/Startup';
import { StartupFollow } from '../models/StartupFollow';
import { StartupTeam } from '../models/StartupTeam';
import { StartupPhoto } from '../models/StartupPhoto';

interface SearchFilters {
  keyword?: string;
  industry?: string[];
  stage?: string[];
  location?: string[];
  fundingMin?: number;
  fundingMax?: number;
  employeeMin?: number;
  employeeMax?: number;
  foundedAfter?: Date;
  foundedBefore?: Date;
  hasVerification?: boolean;
  sortBy?: 'trending' | 'followers' | 'recent' | 'relevance';
  limit?: number;
  offset?: number;
}

interface TrendingMetrics {
  viewsIncrease: number;
  newFollowers: number;
  engagementScore: number;
  mediaEngagement: number;
}

interface SimilarStartupScore {
  startupId: string;
  similarity: number;
  commonFactors: string[];
}

@Injectable()
export class StartupDiscoveryService {
  private readonly logger = new Logger(StartupDiscoveryService.name);

  constructor(
    @InjectRepository(Startup)
    private startupRepository: Repository<Startup>,
    @InjectRepository(StartupFollow)
    private followRepository: Repository<StartupFollow>,
    @InjectRepository(StartupTeam)
    private teamRepository: Repository<StartupTeam>,
    @InjectRepository(StartupPhoto)
    private photoRepository: Repository<StartupPhoto>,
  ) {}

  // ==================== SEARCH ====================

  /**
   * Advanced search with multiple filters
   */
  async searchStartups(filters: SearchFilters) {
    let query = this.startupRepository
      .createQueryBuilder('startup')
      .leftJoinAndSelect('startup.verification', 'verification')
      .leftJoinAndSelect('startup.metrics', 'metrics');

    // Keyword search
    if (filters.keyword) {
      query = query.andWhere(
        `(startup.name ILIKE :keyword OR startup.description ILIKE :keyword OR startup.mission ILIKE :keyword)`,
        { keyword: `%${filters.keyword}%` },
      );
    }

    // Industry filter
    if (filters.industry && filters.industry.length > 0) {
      query = query.andWhere('startup.industry IN (:industries)', { industries: filters.industry });
    }

    // Stage filter
    if (filters.stage && filters.stage.length > 0) {
      query = query.andWhere('startup.funding_stage IN (:stages)', { stages: filters.stage });
    }

    // Location filter
    if (filters.location && filters.location.length > 0) {
      query = query.andWhere('startup.headquarters IN (:locations)', {
        locations: filters.location,
      });
    }

    // Funding range
    if (filters.fundingMin !== undefined) {
      query = query.andWhere('startup.total_funding >= :fundingMin', {
        fundingMin: filters.fundingMin,
      });
    }
    if (filters.fundingMax !== undefined) {
      query = query.andWhere('startup.total_funding <= :fundingMax', {
        fundingMax: filters.fundingMax,
      });
    }

    // Employee count range
    if (filters.employeeMin !== undefined) {
      query = query.andWhere('startup.employee_count >= :employeeMin', {
        employeeMin: filters.employeeMin,
      });
    }
    if (filters.employeeMax !== undefined) {
      query = query.andWhere('startup.employee_count <= :employeeMax', {
        employeeMax: filters.employeeMax,
      });
    }

    // Founded date range
    if (filters.foundedAfter) {
      query = query.andWhere('startup.founding_date >= :foundedAfter', {
        foundedAfter: filters.foundedAfter,
      });
    }
    if (filters.foundedBefore) {
      query = query.andWhere('startup.founding_date <= :foundedBefore', {
        foundedBefore: filters.foundedBefore,
      });
    }

    // Verification filter
    if (filters.hasVerification) {
      query = query.andWhere('verification.status = :verificationStatus', {
        verificationStatus: 'VERIFIED',
      });
    }

    // Sorting
    const sortBy = filters.sortBy || 'relevance';
    switch (sortBy) {
      case 'trending':
        query = query.orderBy('metrics.trending_score', 'DESC');
        break;
      case 'followers':
        query = query.orderBy('metrics.followers_count', 'DESC');
        break;
      case 'recent':
        query = query.orderBy('startup.created_at', 'DESC');
        break;
      case 'relevance':
      default:
        query = query.orderBy('startup.created_at', 'DESC');
    }

    // Pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    const [startups, total] = await query.take(limit).skip(offset).getManyAndCount();

    this.logger.log(`Searched startups with filters, found ${total} results`);

    return {
      data: startups,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get trending startups
   */
  async getTrendingStartups(limit: number = 10, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const query = this.startupRepository
      .createQueryBuilder('startup')
      .leftJoinAndSelect('startup.metrics', 'metrics')
      .leftJoinAndSelect('startup.verification', 'verification')
      .where('startup.created_at >= :startDate', { startDate });

    const startups = await query.orderBy('metrics.trending_score', 'DESC').take(limit).getMany();

    return {
      data: startups,
      period: `Last ${days} days`,
    };
  }

  /**
   * Calculate trending score for a startup
   */
  async calculateTrendingScore(startupId: string): Promise<number> {
    const startup = await this.startupRepository.findOne({
      where: { id: startupId },
      relations: ['metrics'],
    });

    if (!startup) {
      throw new Error(`Startup with ID ${startupId} not found`);
    }

    // Get metrics from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Count new followers
    const newFollowersCount = await this.followRepository.count({
      where: {
        startupId,
        followedAt: Between(sevenDaysAgo, new Date()),
        unfollowedAt: null,
      },
    });

    // Count photos views
    const photos = await this.photoRepository.find({
      where: { startup: { id: startupId }, deletedAt: null },
    });

    const photoViewsIncrease = photos.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
    const photoLikesIncrease = photos.reduce((sum, p) => sum + (p.likesCount || 0), 0);

    // Calculate trending score
    // Weight: followers (40%), views (30%), likes (20%), time decay (10%)
    const trendingScore =
      newFollowersCount * 40 + photoViewsIncrease * 0.3 + photoLikesIncrease * 0.2;

    return Math.round(trendingScore);
  }

  /**
   * Get recommended startups for a user
   */
  async getRecommendations(userId: string, limit: number = 10) {
    // Get startups user is already following
    const userFollows = await this.followRepository.find({
      where: { userId, unfollowedAt: null },
    });

    const followedStartupIds = userFollows.map((f) => f.startupId);

    // Get similar startups based on followed ones
    const recommendations = new Map<string, SimilarStartupScore>();

    for (const follow of userFollows) {
      const similar = await this.getSimilarStartups(follow.startupId, 5);
      similar.forEach((sim) => {
        if (!followedStartupIds.includes(sim.startupId)) {
          const existing = recommendations.get(sim.startupId);
          if (existing) {
            existing.similarity = Math.max(existing.similarity, sim.similarity);
            existing.commonFactors = [
              ...new Set([...existing.commonFactors, ...sim.commonFactors]),
            ];
          } else {
            recommendations.set(sim.startupId, sim);
          }
        }
      });
    }

    // Sort by similarity score and get top N
    const sortedRecommendations = Array.from(recommendations.values())
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    // Get full startup details
    const startupIds = sortedRecommendations.map((r) => r.startupId);
    const startups = await this.startupRepository.find({
      where: { id: In(startupIds) },
      relations: ['verification', 'metrics'],
    });

    // Merge with similarity scores
    const result = startups.map((startup) => {
      const scoreData = sortedRecommendations.find((r) => r.startupId === startup.id);
      return {
        startup,
        similarityScore: scoreData?.similarity || 0,
        commonFactors: scoreData?.commonFactors || [],
      };
    });

    return {
      data: result,
      count: result.length,
    };
  }

  /**
   * Get similar startups based on industry, stage, funding, location
   */
  async getSimilarStartups(startupId: string, limit: number = 5): Promise<SimilarStartupScore[]> {
    const startup = await this.startupRepository.findOne({
      where: { id: startupId },
    });

    if (!startup) {
      throw new Error(`Startup with ID ${startupId} not found`);
    }

    let query = this.startupRepository
      .createQueryBuilder('startup')
      .where('startup.id != :startupId', { startupId });

    // Find startups with similar characteristics
    const similarCriteria = [];

    if (startup.industry) {
      query = query.orWhere('startup.industry = :industry', { industry: startup.industry });
      similarCriteria.push('industry');
    }

    if (startup.fundingStage) {
      query = query.orWhere('startup.funding_stage = :fundingStage', {
        fundingStage: startup.fundingStage,
      });
      similarCriteria.push('stage');
    }

    if (startup.headquarters) {
      query = query.orWhere('startup.headquarters = :location', { location: startup.headquarters });
      similarCriteria.push('location');
    }

    const candidates = await query.take(50).getMany();

    // Score candidates based on similarity
    const scored = candidates.map((candidate) => {
      let score = 0;
      const factors: string[] = [];

      // Industry match (weight: 40%)
      if (candidate.industry === startup.industry) {
        score += 40;
        factors.push('same-industry');
      }

      // Stage match (weight: 30%)
      if (candidate.fundingStage === startup.fundingStage) {
        score += 30;
        factors.push('same-stage');
      }

      // Location match (weight: 20%)
      if (candidate.headquarters === startup.headquarters) {
        score += 20;
        factors.push('same-location');
      }

      // Funding similarity (weight: 10%)
      if (startup.totalFunding && candidate.totalFunding) {
        const fundingDiff = Math.abs(candidate.totalFunding - startup.totalFunding);
        const fundingMax = Math.max(candidate.totalFunding, startup.totalFunding);
        const fundingSimilarity = ((fundingMax - fundingDiff) / fundingMax) * 10;
        score += fundingSimilarity;
        factors.push('similar-funding');
      }

      return {
        startupId: candidate.id,
        similarity: score,
        commonFactors: factors,
      };
    });

    return scored
      .filter((s) => s.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // ==================== FOLLOW & BOOKMARK ====================

  /**
   * Follow a startup
   */
  async followStartup(userId: string, startupId: string, metadata?: any) {
    const startup = await this.startupRepository.findOne({
      where: { id: startupId },
    });

    if (!startup) {
      throw new Error(`Startup with ID ${startupId} not found`);
    }

    // Check if already following
    let follow = await this.followRepository.findOne({
      where: { userId, startupId },
    });

    if (follow) {
      // Refollow if previously unfollowed
      if (follow.unfollowedAt) {
        follow.refollow();
      }
      return follow;
    }

    // Create new follow
    follow = this.followRepository.create({
      userId,
      startupId,
      metadata: metadata || {},
    });

    const saved = await this.followRepository.save(follow);
    this.logger.log(`User ${userId} followed startup ${startupId}`);
    return saved;
  }

  /**
   * Unfollow a startup
   */
  async unfollowStartup(userId: string, startupId: string) {
    const follow = await this.followRepository.findOne({
      where: { userId, startupId },
    });

    if (!follow) {
      throw new Error('Follow relationship not found');
    }

    follow.unfollow();
    const updated = await this.followRepository.save(follow);
    this.logger.log(`User ${userId} unfollowed startup ${startupId}`);
    return updated;
  }

  /**
   * Bookmark a startup
   */
  async bookmarkStartup(userId: string, startupId: string) {
    let follow = await this.followRepository.findOne({
      where: { userId, startupId },
    });

    if (!follow) {
      follow = this.followRepository.create({
        userId,
        startupId,
        isBookmarked: true,
      });
    } else {
      follow.isBookmarked = true;
    }

    const saved = await this.followRepository.save(follow);
    this.logger.log(`User ${userId} bookmarked startup ${startupId}`);
    return saved;
  }

  /**
   * Remove bookmark
   */
  async removeBookmark(userId: string, startupId: string) {
    const follow = await this.followRepository.findOne({
      where: { userId, startupId },
    });

    if (!follow) {
      throw new Error('Bookmark not found');
    }

    follow.isBookmarked = false;
    const updated = await this.followRepository.save(follow);
    return updated;
  }

  /**
   * Get user's followed startups
   */
  async getUserFollows(userId: string, limit: number = 20, offset: number = 0) {
    const [follows, total] = await this.followRepository.findAndCount({
      where: { userId, unfollowedAt: null },
      relations: ['startup', 'startup.verification', 'startup.metrics'],
      take: limit,
      skip: offset,
      order: { followedAt: 'DESC' },
    });

    return {
      data: follows,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user's bookmarked startups
   */
  async getUserBookmarks(userId: string, limit: number = 20, offset: number = 0) {
    const [bookmarks, total] = await this.followRepository.findAndCount({
      where: { userId, isBookmarked: true },
      relations: ['startup', 'startup.verification', 'startup.metrics'],
      take: limit,
      skip: offset,
      order: { updatedAt: 'DESC' },
    });

    return {
      data: bookmarks,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Check if user follows startup
   */
  async isFollowing(userId: string, startupId: string): Promise<boolean> {
    const follow = await this.followRepository.findOne({
      where: { userId, startupId, unfollowedAt: null },
    });

    return !!follow;
  }

  /**
   * Check if user bookmarked startup
   */
  async isBookmarked(userId: string, startupId: string): Promise<boolean> {
    const follow = await this.followRepository.findOne({
      where: { userId, startupId, isBookmarked: true },
    });

    return !!follow;
  }

  // ==================== DISCOVERY ANALYTICS ====================

  /**
   * Get startup followers count
   */
  async getFollowersCount(startupId: string): Promise<number> {
    return this.followRepository.count({
      where: { startupId, unfollowedAt: null },
    });
  }

  /**
   * Get top followers for startup
   */
  async getTopFollowers(startupId: string, limit: number = 10) {
    return this.followRepository.find({
      where: { startupId, unfollowedAt: null },
      order: { followedAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get similar startups for discovery page
   */
  async getDiscoveryPage(userId?: string, limit: number = 20) {
    // Get trending startups
    const trending = await this.getTrendingStartups(5, 7);

    // Get recommended startups if userId provided
    let recommended = { data: [], count: 0 };
    if (userId) {
      recommended = await this.getRecommendations(userId, 5);
    }

    // Get featured/verified startups
    const featured = await this.startupRepository.find({
      where: { verification: { status: 'VERIFIED' } },
      relations: ['verification', 'metrics'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      trending: trending.data,
      recommended: recommended.data.map((r) => ({
        ...r.startup,
        similarityScore: r.similarityScore,
      })),
      featured,
      sections: ['trending', 'recommended', 'featured'],
    };
  }

  /**
   * Track discovery analytics
   */
  async trackDiscoveryAction(
    startupId: string,
    action: 'view' | 'search' | 'recommend',
    userId?: string,
  ) {
    // This would typically update analytics in a metrics table
    this.logger.log(`Discovery action: ${action} on startup ${startupId} by user ${userId}`);
    return { success: true };
  }
}
