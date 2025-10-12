import { Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { JobService, JobFilters } from '@/services/JobService';
import { logger } from '@/utils/logger';
import { 
  JobType, 
  WorkLocation, 
  ExperienceLevel, 
  JobCategory 
} from '@startup-platform/types';

export class JobController {
  private jobService: JobService;

  constructor() {
    this.jobService = new JobService();
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
    }
  };
}