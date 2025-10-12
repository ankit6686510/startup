import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { JobService } from '@/services/JobService';
import { ApplicationStatus } from '@/models/JobApplication';
import { logger } from '@/utils/logger';

export class ApplicationController {
  private jobService: JobService;

  constructor() {
    this.jobService = new JobService();
  }

  // Validation rules
  static applyToJobValidation = [
    body('jobId').notEmpty().withMessage('Job ID is required'),
    body('emailAddress').isEmail().withMessage('Valid email address is required'),
    body('fullName').isLength({ min: 1, max: 200 }).withMessage('Full name is required and must be less than 200 characters'),
    body('coverLetter').optional().isLength({ max: 5000 }).withMessage('Cover letter must be less than 5000 characters'),
    body('yearsOfExperience').optional().isInt({ min: 0, max: 50 }).withMessage('Years of experience must be between 0 and 50'),
    body('salaryExpectation').optional().isInt({ min: 0 }).withMessage('Salary expectation must be a positive number'),
    body('noticePeriodDays').optional().isInt({ min: 0, max: 365 }).withMessage('Notice period must be between 0 and 365 days'),
    body('requiresVisaSponsorship').optional().isBoolean().withMessage('Visa sponsorship must be a boolean'),
    body('willingToRelocate').optional().isBoolean().withMessage('Willing to relocate must be a boolean'),
  ];

  static updateApplicationStatusValidation = [
    body('status').isIn(Object.values(ApplicationStatus)).withMessage('Invalid application status'),
    body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters'),
  ];

  applyToJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const applicationData = {
        ...req.body,
        applicantId: userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      };

      const application = await this.jobService.applyToJob(applicationData);

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: { application },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Apply to job error:', error);
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        next(error);
      }
    }
  };

  getJobApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { jobId } = req.params;
      const startupId = req.query.startupId as string;

      const applications = await this.jobService.getJobApplications(jobId, startupId);

      res.json({
        success: true,
        data: { applications },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get job applications error:', error);
      next(error);
    }
  };

  getUserApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const { applications, total } = await this.jobService.getUserApplications(userId, page, limit);

      res.json({
        success: true,
        data: { applications },
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
      logger.error('Get user applications error:', error);
      next(error);
    }
  };

  updateApplicationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const { applicationId } = req.params;
      const { status, notes } = req.body;
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const application = await this.jobService.updateApplicationStatus(
        applicationId,
        status,
        userId,
        notes
      );

      res.json({
        success: true,
        message: 'Application status updated successfully',
        data: { application },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Update application status error:', error);
      if (error instanceof Error) {
        res.status(404).json({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        next(error);
      }
    }
  };

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

      res.json({
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

  getUserSavedJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      logger.error('Get user saved jobs error:', error);
      next(error);
    }
  };

  createJobAlert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const alert = await this.jobService.createJobAlert(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Job alert created successfully',
        data: { alert },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Create job alert error:', error);
      next(error);
    }
  };

  getUserJobAlerts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const alerts = await this.jobService.getUserJobAlerts(userId);

      res.json({
        success: true,
        data: { alerts },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get user job alerts error:', error);
      next(error);
    }
  };

  updateJobAlert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { alertId } = req.params;
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const alert = await this.jobService.updateJobAlert(alertId, userId, req.body);

      res.json({
        success: true,
        message: 'Job alert updated successfully',
        data: { alert },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Update job alert error:', error);
      if (error instanceof Error) {
        res.status(404).json({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        next(error);
      }
    }
  };

  deleteJobAlert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { alertId } = req.params;
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await this.jobService.deleteJobAlert(alertId, userId);

      res.json({
        success: true,
        message: 'Job alert deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Delete job alert error:', error);
      if (error instanceof Error) {
        res.status(404).json({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        next(error);
      }
    }
  };
}