import { Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { JobService, JobFilters } from '@/services/JobService';
import { RecommendationService, UserProfile } from '@/services/RecommendationService';
import { logger } from '@/utils/logger';
import { 
  JobType, 
  WorkLocation, 
  ExperienceLevel, 
  JobCategory 
} from '@startup-platform/types';

export class JobController {
  private jobService: JobService;
  private recommendationService: RecommendationService;

  constructor() {
    this.jobService = new JobService();
    this.recommendationService = new RecommendationService();
  }

  // Validation rules
  static createJobValidation = [
    body('startupId').notEmpty().withMessage('Startup ID is required'),
    body('title').isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
    body('description').isLength({ min: 50 }).withMessage('Description must be at least 50 characters'),
    body('type').isIn(Object.values(JobType)).withMessage('Invalid job type'),
    body('locationType').isIn(Object.values(WorkLocation)).withMessage('Invalid location type'),
    body('experienceLevel').isIn(Object.values(ExperienceLevel)).withMessage('Invalid experience level'),
    body('category').isIn(Object.values(JobCategory)).withMessage('Invalid job category'),
    body('skills').isArray().withMessage('Skills must be an array'),
    body('salaryMin').optional().isInt({ min: 0 }).withMessage('Minimum salary must be a positive number'),
    body('salaryMax').optional().isInt({ min: 0 }).withMessage('Maximum salary must be a positive number'),
  ];

  static updateJobValidation = [
    body('title').optional().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
    body('description').optional().isLength({ min: 50 }).withMessage('Description must be at least 50 characters'),
    body('type').optional().isIn(Object.values(JobType)).withMessage('Invalid job type'),
    body('locationType').optional().isIn(Object.values(WorkLocation)).withMessage('Invalid location type'),
    body('experienceLevel').optional().isIn(Object.values(ExperienceLevel)).withMessage('Invalid experience level'),
    body('category').optional().isIn(Object.values(JobCategory)).withMessage('Invalid job category'),
    body('skills').optional().isArray().withMessage('Skills must be an array'),
    body('salaryMin').optional().isInt({ min: 0 }).withMessage('Minimum salary must be a positive number'),
    body('salaryMax').optional().isInt({ min: 0 }).withMessage('Maximum salary must be a positive number'),
  ];

  static searchJobsValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('category').optional().isIn(Object.values(JobCategory)).withMessage('Invalid job category'),
    query('type').optional().isIn(Object.values(JobType)).withMessage('Invalid job type'),
    query('locationType').optional().isIn(Object.values(WorkLocation)).withMessage('Invalid location type'),
    query('experienceLevel').optional().isIn(Object.values(ExperienceLevel)).withMessage('Invalid experience level'),
  ];

  createJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const jobData = {
        ...req.body,
        postedBy: userId,
      };

      const job = await this.jobService.createJob(jobData);

      res.status(201).json({
        success: true,
        message: 'Job created successfully',
        data: { job },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Create job error:', error);
      next(error);
    }
  };

  updateJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { id } = req.params;
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const job = await this.jobService.updateJob(id, req.body, userId);

      res.json({
        success: true,
        message: 'Job updated successfully',
        data: { job },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Update job error:', error);
      if (error instanceof Error) {
        res.status(error.message.includes('not found') ? 404 : 403).json({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        next(error);
      }
    }
  };

  getJobById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const job = await this.jobService.getJobById(id);

      if (!job) {
        res.status(404).json({
          success: false,
          message: 'Job not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        success: true,
        data: { job },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get job by ID error:', error);
      next(error);
    }
  };

  getJobBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const job = await this.jobService.getJobBySlug(slug);

      if (!job) {
        res.status(404).json({
          success: false,
          message: 'Job not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        success: true,
        data: { job },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get job by slug error:', error);
      next(error);
    }
  };

  getJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const filters: JobFilters = {};
      if (req.query.search) filters.search = req.query.search as string;
      if (req.query.category) filters.category = req.query.category as JobCategory;
      if (req.query.type) filters.type = req.query.type as JobType;
      if (req.query.locationType) filters.locationType = req.query.locationType as WorkLocation;
      if (req.query.experienceLevel) filters.experienceLevel = req.query.experienceLevel as ExperienceLevel;
      if (req.query.location) filters.location = req.query.location as string;
      if (req.query.salaryMin) filters.salaryMin = parseInt(req.query.salaryMin as string);
      if (req.query.salaryMax) filters.salaryMax = parseInt(req.query.salaryMax as string);
      if (req.query.skills) {
        filters.skills = Array.isArray(req.query.skills) ? req.query.skills as string[] : [req.query.skills as string];
      }
      if (req.query.startupIds) {
        filters.startupIds = Array.isArray(req.query.startupIds) ? req.query.startupIds as string[] : [req.query.startupIds as string];
      }
      if (req.query.isRemote) filters.isRemote = req.query.isRemote === 'true';
      if (req.query.isFeatured) filters.isFeatured = req.query.isFeatured === 'true';
      if (req.query.postedSince) filters.postedSince = new Date(req.query.postedSince as string);

      const { jobs, total } = await this.jobService.getJobs(filters, page, limit);

      res.json({
        success: true,
        data: { jobs },
        meta: {
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          filters,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get jobs error:', error);
      next(error);
    }
  };

  getFeaturedJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const jobs = await this.jobService.getFeaturedJobs(limit);

      res.json({
        success: true,
        data: { jobs },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get featured jobs error:', error);
      next(error);
    }
  };

  getJobsByStartup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startupId } = req.params;
      const includeInactive = req.query.includeInactive === 'true';

      const jobs = await this.jobService.getJobsByStartup(startupId, includeInactive);

      res.json({
        success: true,
        data: { jobs },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get jobs by startup error:', error);
      next(error);
    }
  };

  searchJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { q } = req.query;
      if (!q) {
        res.status(400).json({
          success: false,
          message: 'Search query is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const filters: JobFilters = {};
      if (req.query.category) filters.category = req.query.category as JobCategory;
      if (req.query.type) filters.type = req.query.type as JobType;
      if (req.query.locationType) filters.locationType = req.query.locationType as WorkLocation;
      if (req.query.experienceLevel) filters.experienceLevel = req.query.experienceLevel as ExperienceLevel;
      if (req.query.location) filters.location = req.query.location as string;

      const { jobs, total } = await this.jobService.searchJobs(q as string, filters, page, limit);

      res.json({
        success: true,
        data: { jobs },
        meta: {
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          searchQuery: q,
          filters,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Search jobs error:', error);
      next(error);
    }
  };

  deleteJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await this.jobService.deleteJob(id, userId);

      res.json({
        success: true,
        message: 'Job deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Delete job error:', error);
      if (error instanceof Error) {
        res.status(error.message.includes('not found') ? 404 : 403).json({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        next(error);
      }
    }
  };

  getJobStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startupId } = req.query;
      const stats = await this.jobService.getJobStats(startupId as string);

      res.json({
        success: true,
        data: { stats },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get job stats error:', error);
      next(error);

  // ==================== JOB RECOMMENDATIONS ====================

  getRecommendations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Get user profile from request body or headers
      const userProfile: UserProfile = req.body.userProfile || {
        id: userId,
        skills: req.body.skills || [],
        experience: req.body.experience,
        location: req.body.location,
        preferences: req.body.preferences
      };

      const limit = parseInt(req.query.limit as string) || 20;
      const excludeJobIds = req.body.excludeJobIds || [];

      const recommendations = await this.recommendationService.getRecommendations(
        userProfile,
        limit,
        excludeJobIds
      );

      res.json({
        success: true,
        data: { recommendations },
        meta: {
          total: recommendations.length,
          algorithm: 'skill-based-scoring'
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get recommendations error:', error);
      next(error);
    }
  };

  getSimilarJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { jobId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      const similarJobs = await this.recommendationService.getSimilarJobs(jobId, limit);

      res.json({
        success: true,
        data: { jobs: similarJobs },
        meta: {
          referenceJobId: jobId,
          total: similarJobs.length
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get similar jobs error:', error);
      next(error);
    }
  };

  getTrendingJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const timeWindow = parseInt(req.query.timeWindow as string) || 7; // days

      const trendingJobs = await this.recommendationService.getTrendingJobs(limit, timeWindow);

      res.json({
        success: true,
        data: { jobs: trendingJobs },
        meta: {
          total: trendingJobs.length,
          timeWindow: `${timeWindow} days`
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get trending jobs error:', error);
      next(error);
    }
  };

  getMissedJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const missedJobs = await this.recommendationService.getMissedJobs(userId, limit);

      res.json({
        success: true,
        data: { jobs: missedJobs },
        meta: {
          total: missedJobs.length
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get missed jobs error:', error);
      next(error);
    }
  };

  // ==================== JOB ANALYTICS ====================

  trackJobView = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { jobId } = req.params;
      const userId = req.headers['x-user-id'] as string;

      const viewData = {
        userId: userId || undefined,
        sessionId: req.body.sessionId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        referrer: req.get('referer'),
        utmParams: req.body.utmParams
      };

      const view = await this.jobService.trackJobView(jobId, viewData);

      res.json({
        success: true,
        data: { viewId: view.id },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Track job view error:', error);
      next(error);
    }
  };

  updateViewEngagement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { viewId } = req.params;
      const engagementData = {
        timeSpent: req.body.timeSpent,
        clickedApply: req.body.clickedApply,
        clickedSave: req.body.clickedSave,
        clickedShare: req.body.clickedShare,
        scrolledPercentage: req.body.scrolledPercentage
      };

      await this.jobService.updateViewEngagement(viewId, engagementData);

      res.json({
        success: true,
        message: 'Engagement updated',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Update view engagement error:', error);
      next(error);
    }
  };

  getJobAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { jobId } = req.params;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const analytics = await this.jobService.getJobAnalytics(jobId, startDate, endDate);

      res.json({
        success: true,
        data: analytics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get job analytics error:', error);
      next(error);
    }
  };

  getStartupAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startupId } = req.params;
      const period = parseInt(req.query.period as string) || 30;

      const analytics = await this.jobService.getStartupJobAnalytics(startupId, period);

      res.json({
        success: true,
        data: analytics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get startup analytics error:', error);
      next(error);
    }
  };

  trackJobSave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { jobId } = req.params;
      await this.jobService.trackJobSave(jobId);

      res.json({
        success: true,
        message: 'Save tracked',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Track job save error:', error);
      next(error);
    }
  };

  trackJobShare = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { jobId } = req.params;
      const platform = req.body.platform;

      await this.jobService.trackJobShare(jobId, platform);

      res.json({
        success: true,
        message: 'Share tracked',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Track job share error:', error);
      next(error);
    }
  };

  trackApplyClick = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { jobId } = req.params;
      await this.jobService.trackApplyClick(jobId);

      res.json({
        success: true,
        message: 'Apply click tracked',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Track apply click error:', error);
      next(error);
    }
  };

  // ==================== SAVED JOBS ====================

  saveJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { jobId } = req.params;
      const { notes } = req.body;

      const savedJob = await this.jobService.saveJob(userId, jobId, notes);

      res.status(201).json({
        success: true,
        message: 'Job saved successfully',
        data: { savedJob },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Save job error:', error);
      next(error);
    }
  };

  unsaveJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { jobId } = req.params;
      await this.jobService.unsaveJob(userId, jobId);

      res.json({
        success: true,
        message: 'Job unsaved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Unsave job error:', error);
      next(error);
    }
  };

  getSavedJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { savedJobs, total } = await this.jobService.getUserSavedJobs(userId, page, limit);

      res.json({
        success: true,
        data: { savedJobs },
        meta: {
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get saved jobs error:', error);
      next(error);
    }
  };

  // ==================== ADVANCED SEARCH ====================

  advancedSearch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const sort = (req.query.sort as any) || 'relevance';
      const includeFacets = req.query.includeFacets === 'true';

      const filters: JobFilters = {};
      if (req.query.search) filters.search = req.query.search as string;
      if (req.query.category) filters.category = req.query.category as JobCategory;
      if (req.query.type) filters.type = req.query.type as JobType;
      if (req.query.locationType) filters.locationType = req.query.locationType as WorkLocation;
      if (req.query.experienceLevel) filters.experienceLevel = req.query.experienceLevel as ExperienceLevel;
      if (req.query.location) filters.location = req.query.location as string;
      if (req.query.salaryMin) filters.salaryMin = parseInt(req.query.salaryMin as string);
      if (req.query.salaryMax) filters.salaryMax = parseInt(req.query.salaryMax as string);
      if (req.query.skills) {
        filters.skills = Array.isArray(req.query.skills) 
          ? req.query.skills as string[] 
          : [req.query.skills as string];
      }
      if (req.query.isRemote) filters.isRemote = req.query.isRemote === 'true';

      const result = await this.jobService.advancedSearch({
        query: req.query.q as string,
        filters,
        sort,
        page,
        limit,
        includeFacets
      });

      res.json({
        success: true,
        data: {
          jobs: result.jobs,
          facets: result.facets
        },
        meta: {
          pagination: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
          },
          filters,
          sort
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Advanced search error:', error);
      next(error);
    }
  };
    }
  };
}