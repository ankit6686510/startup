import { Repository, In } from 'typeorm';
import { AppDataSource } from '@/config/database';
import { Job } from '@/models/Job';
import { JobApplication } from '@/models/JobApplication';
import { SavedJob } from '@/models/SavedJob';
import { JobView } from '@/models/JobView';
import { logger } from '@/utils/logger';

export interface UserProfile {
  id: string;
  skills: string[];
  experience?: number;
  location?: {
    country?: string;
    city?: string;
  };
  preferences?: {
    jobTypes?: string[];
    categories?: string[];
    salaryMin?: number;
    remoteOnly?: boolean;
  };
  savedJobIds?: string[];
  appliedJobIds?: string[];
  viewedJobIds?: string[];
}

export interface RecommendationScore {
  job: Job;
  score: number;
  reasons: string[];
}

export class RecommendationService {
  private jobRepository: Repository<Job>;
  private applicationRepository: Repository<JobApplication>;
  private savedJobRepository: Repository<SavedJob>;
  private viewRepository: Repository<JobView>;

  constructor() {
    this.jobRepository = AppDataSource.getRepository(Job);
    this.applicationRepository = AppDataSource.getRepository(JobApplication);
    this.savedJobRepository = AppDataSource.getRepository(SavedJob);
    this.viewRepository = AppDataSource.getRepository(JobView);
  }

  /**
   * Get personalized job recommendations for a user
   */
  async getRecommendations(
    userProfile: UserProfile,
    limit: number = 20,
    excludeJobIds: string[] = []
  ): Promise<RecommendationScore[]> {
    try {
      // Fetch active jobs
      const queryBuilder = this.jobRepository
        .createQueryBuilder('job')
        .where('job.isActive = :isActive', { isActive: true })
        .andWhere('job.expiresAt > :now', { now: new Date() });

      // Exclude already applied or saved jobs
      const allExcludeIds = [
        ...excludeJobIds,
        ...(userProfile.appliedJobIds || []),
        ...(userProfile.savedJobIds || [])
      ];

      if (allExcludeIds.length > 0) {
        queryBuilder.andWhere('job.id NOT IN (:...excludeIds)', { excludeIds: allExcludeIds });
      }

      const jobs = await queryBuilder.take(100).getMany(); // Get more than needed for scoring

      // Score each job
      const scoredJobs = jobs.map(job => ({
        job,
        score: this.calculateJobScore(job, userProfile),
        reasons: this.generateReasons(job, userProfile)
      }));

      // Sort by score and return top results
      return scoredJobs
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      logger.error('Error generating recommendations:', error);
      throw error;
    }
  }

  /**
   * Get similar jobs based on a given job
   */
  async getSimilarJobs(jobId: string, limit: number = 10): Promise<Job[]> {
    const referenceJob = await this.jobRepository.findOne({
      where: { id: jobId }
    });

    if (!referenceJob) {
      throw new Error('Job not found');
    }

    // Find jobs with similar characteristics
    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .where('job.id != :jobId', { jobId })
      .andWhere('job.isActive = :isActive', { isActive: true })
      .andWhere('job.expiresAt > :now', { now: new Date() });

    // Same category is high priority
    queryBuilder.andWhere('job.category = :category', { category: referenceJob.category });

    // Similar experience level
    if (referenceJob.experienceLevel) {
      queryBuilder.andWhere('job.experienceLevel = :experienceLevel', {
        experienceLevel: referenceJob.experienceLevel
      });
    }

    // Similar location
    if (referenceJob.locationCountry) {
      queryBuilder.andWhere('job.locationCountry = :locationCountry', {
        locationCountry: referenceJob.locationCountry
      });
    }

    // Order by created date
    queryBuilder.orderBy('job.createdAt', 'DESC').limit(limit);

    return await queryBuilder.getMany();
  }

  /**
   * Get trending jobs based on engagement metrics
   */
  async getTrendingJobs(limit: number = 20, timeWindow: number = 7): Promise<Job[]> {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - timeWindow);

    // Get jobs with high engagement in the time window
    const result = await this.jobRepository
      .createQueryBuilder('job')
      .leftJoin('job_views', 'views', 'views.job_id = job.id')
      .leftJoin('saved_jobs', 'saved', 'saved.job_id = job.id')
      .where('job.isActive = :isActive', { isActive: true })
      .andWhere('job.createdAt >= :sinceDate', { sinceDate })
      .select('job.*')
      .addSelect('COUNT(DISTINCT views.id)', 'view_count')
      .addSelect('COUNT(DISTINCT saved.id)', 'save_count')
      .addSelect('job.applicationCount', 'app_count')
      .groupBy('job.id')
      .orderBy('(COUNT(DISTINCT views.id) + COUNT(DISTINCT saved.id) * 2 + job.applicationCount * 3)', 'DESC')
      .limit(limit)
      .getRawMany();

    // Fetch full job entities
    const jobIds = result.map(r => r.job_id);
    return await this.jobRepository.findBy({ id: In(jobIds) });
  }

  /**
   * Get jobs you may have missed
   */
  async getMissedJobs(userId: string, limit: number = 10): Promise<Job[]> {
    // Get user's recent activity
    const recentViews = await this.viewRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50
    });

    const viewedJobIds = recentViews.map(v => v.jobId);

    // Find high-quality jobs posted in last 7 days that user hasn't seen
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .where('job.isActive = :isActive', { isActive: true })
      .andWhere('job.createdAt >= :since', { since: sevenDaysAgo })
      .andWhere('job.viewCount >= :minViews', { minViews: 10 }); // Popular jobs

    if (viewedJobIds.length > 0) {
      queryBuilder.andWhere('job.id NOT IN (:...viewedIds)', { viewedIds: viewedJobIds });
    }

    return await queryBuilder
      .orderBy('job.viewCount', 'DESC')
      .addOrderBy('job.applicationCount', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * Calculate a relevance score for a job based on user profile
   */
  private calculateJobScore(job: Job, userProfile: UserProfile): number {
    let score = 0;

    // Skills match (highest weight)
    if (userProfile.skills && userProfile.skills.length > 0 && job.skills.length > 0) {
      const skillsMatch = this.calculateSkillsMatch(job.skills, userProfile.skills);
      score += skillsMatch * 40; // Max 40 points
    }

    // Experience level match
    if (userProfile.experience !== undefined) {
      const experienceMatch = this.matchExperienceLevel(job, userProfile.experience);
      score += experienceMatch * 20; // Max 20 points
    }

    // Location match
    if (userProfile.location) {
      const locationMatch = this.matchLocation(job, userProfile.location);
      score += locationMatch * 15; // Max 15 points
    }

    // Job type preference
    if (userProfile.preferences?.jobTypes && userProfile.preferences.jobTypes.length > 0) {
      if (userProfile.preferences.jobTypes.includes(job.type)) {
        score += 10;
      }
    }

    // Category preference
    if (userProfile.preferences?.categories && userProfile.preferences.categories.length > 0) {
      if (userProfile.preferences.categories.includes(job.category)) {
        score += 10;
      }
    }

    // Salary match
    if (userProfile.preferences?.salaryMin && job.salaryMin) {
      if (job.salaryMin >= userProfile.preferences.salaryMin) {
        score += 5;
      }
    }

    // Remote preference
    if (userProfile.preferences?.remoteOnly === true && job.isRemoteAllowed) {
      score += 10;
    }

    // Boost for featured jobs
    if (job.isFeatured) {
      score += 5;
    }

    // Boost for recent jobs (recency bonus)
    const daysSincePosted = Math.floor(
      (Date.now() - job.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSincePosted <= 3) {
      score += 5;
    } else if (daysSincePosted <= 7) {
      score += 3;
    }

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Calculate skills match percentage
   */
  private calculateSkillsMatch(jobSkills: string[], userSkills: string[]): number {
    if (jobSkills.length === 0 || userSkills.length === 0) return 0;

    const normalizedJobSkills = jobSkills.map(s => s.toLowerCase());
    const normalizedUserSkills = userSkills.map(s => s.toLowerCase());

    const matchingSkills = normalizedJobSkills.filter(skill =>
      normalizedUserSkills.some(userSkill =>
        userSkill.includes(skill) || skill.includes(userSkill)
      )
    );

    return matchingSkills.length / jobSkills.length;
  }

  /**
   * Match experience level
   */
  private matchExperienceLevel(job: Job, userExperience: number): number {
    const experienceLevelMap = {
      'INTERN': { min: 0, max: 1 },
      'ENTRY': { min: 0, max: 2 },
      'MID': { min: 2, max: 5 },
      'SENIOR': { min: 5, max: 10 },
      'LEAD': { min: 8, max: 15 },
      'EXECUTIVE': { min: 10, max: 30 }
    };

    const levelRange = experienceLevelMap[job.experienceLevel as unknown as keyof typeof experienceLevelMap];

    if (!levelRange) return 0.5; // Default moderate match

    if (userExperience >= levelRange.min && userExperience <= levelRange.max) {
      return 1; // Perfect match
    } else if (userExperience < levelRange.min) {
      return 0.3; // Under-qualified
    } else {
      return 0.7; // Over-qualified (still valuable)
    }
  }

  /**
   * Match location
   */
  private matchLocation(job: Job, userLocation: { country?: string; city?: string }): number {
    // Remote jobs always match
    if (job.isRemoteAllowed) return 1;

    let score = 0;

    if (userLocation.country && job.locationCountry) {
      if (userLocation.country.toLowerCase() === job.locationCountry.toLowerCase()) {
        score += 0.7;

        // City match is bonus
        if (userLocation.city && job.locationCity) {
          if (userLocation.city.toLowerCase() === job.locationCity.toLowerCase()) {
            score += 0.3;
          }
        }
      }
    }

    return score;
  }

  /**
   * Generate human-readable reasons for recommendation
   */
  private generateReasons(job: Job, userProfile: UserProfile): string[] {
    const reasons: string[] = [];

    // Skills match
    if (userProfile.skills && userProfile.skills.length > 0 && job.skills.length > 0) {
      const matchingSkills = job.skills.filter(skill =>
        userProfile.skills.some(userSkill =>
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );

      if (matchingSkills.length > 0) {
        reasons.push(`Matches ${matchingSkills.length} of your skills: ${matchingSkills.slice(0, 3).join(', ')}`);
      }
    }

    // Location match
    if (job.isRemoteAllowed && userProfile.preferences?.remoteOnly) {
      reasons.push('Remote work available');
    } else if (userProfile.location?.city && job.locationCity === userProfile.location.city) {
      reasons.push(`Located in ${job.locationCity}`);
    }

    // Experience level
    if (userProfile.experience !== undefined) {
      reasons.push(`${job.experienceLevel.toLowerCase()} level position`);
    }

    // Salary
    if (job.salaryMin && userProfile.preferences?.salaryMin) {
      if (job.salaryMin >= userProfile.preferences.salaryMin) {
        reasons.push('Meets your salary expectations');
      }
    }

    // Featured/trending
    if (job.isFeatured) {
      reasons.push('Featured opportunity');
    }

    // Recent posting
    const daysSincePosted = Math.floor(
      (Date.now() - job.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSincePosted <= 3) {
      reasons.push('Recently posted');
    }

    return reasons;
  }
}
