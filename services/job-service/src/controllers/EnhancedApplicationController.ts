import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ApplicationManagementService } from '@/services/ApplicationManagementService';
import { ApplicationStatus } from '@/models/JobApplication';
import { logger } from '@/utils/logger';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG allowed'));
    }
  },
});

export class ApplicationController {
  private applicationService: ApplicationManagementService;

  constructor() {
    this.applicationService = new ApplicationManagementService();
  }

  // ==================== VALIDATION RULES ====================

  static uploadDocumentValidation = [
    param('applicationId').isUUID().withMessage('Valid application ID required'),
    body('documentType')
      .isIn(['resume', 'cover_letter', 'portfolio', 'other'])
      .withMessage('Document type must be resume, cover_letter, portfolio, or other'),
    body('isPrimary').optional().isBoolean().withMessage('isPrimary must be boolean'),
  ];

  static updateStatusValidation = [
    param('applicationId').isUUID().withMessage('Valid application ID required'),
    body('status').isIn(Object.values(ApplicationStatus)).withMessage('Invalid application status'),
    body('reason')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Reason must be less than 500 characters'),
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Notes must be less than 1000 characters'),
  ];

  static bulkUpdateStatusValidation = [
    body('applicationIds')
      .isArray({ min: 1 })
      .withMessage('Application IDs array required with at least 1 item'),
    body('applicationIds.*').isUUID().withMessage('Each application ID must be valid UUID'),
    body('status').isIn(Object.values(ApplicationStatus)).withMessage('Invalid application status'),
    body('reason').optional().isLength({ max: 500 }),
  ];

  static filterValidation = [
    query('status')
      .optional()
      .isIn(Object.values(ApplicationStatus))
      .withMessage('Invalid status filter'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ];

  static bulkApplyValidation = [
    body('jobIds').isArray({ min: 1 }).withMessage('Job IDs array required with at least 1 item'),
    body('jobIds.*').isUUID().withMessage('Each job ID must be valid UUID'),
    body('commonData').optional().isObject().withMessage('Common data must be object'),
    body('commonData.emailAddress').isEmail().withMessage('Valid email required'),
    body('commonData.fullName').isLength({ min: 1, max: 200 }).withMessage('Full name required'),
  ];

  // ==================== DOCUMENT MANAGEMENT ====================

  /**
   * Upload resume/document for application
   * POST /applications/:applicationId/documents
   */
  uploadDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      const { documentType, isPrimary } = req.body;

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'File is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const document = await this.applicationService.uploadApplicationDocument(
        applicationId,
        documentType,
        {
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          buffer: req.file.buffer,
        },
        isPrimary === 'true',
      );

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: { document },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Upload document error:', error);
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

  /**
   * Get application documents
   * GET /applications/:applicationId/documents
   */
  getApplicationDocuments = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { applicationId } = req.params;

      const documents = await this.applicationService.getApplicationDocuments(applicationId);

      res.json({
        success: true,
        data: { documents },
        count: documents.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get documents error:', error);
      next(error);
    }
  };

  /**
   * Delete application document
   * DELETE /applications/:applicationId/documents/:documentId
   */
  deleteDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { applicationId, documentId } = req.params;

      await this.applicationService.deleteApplicationDocument(documentId, applicationId);

      res.json({
        success: true,
        message: 'Document deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Delete document error:', error);
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

  // ==================== STATUS MANAGEMENT ====================

  /**
   * Update application status
   * PATCH /applications/:applicationId/status
   */
  updateApplicationStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
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
      const { status, reason, notes } = req.body;
      const changedBy = req.headers['x-user-id'] as string;

      const { application, history } = await this.applicationService.updateApplicationStatus(
        applicationId,
        status,
        changedBy,
        reason,
        notes,
      );

      res.json({
        success: true,
        message: 'Application status updated successfully',
        data: { application, history },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Update status error:', error);
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

  /**
   * Get application status history
   * GET /applications/:applicationId/history
   */
  getApplicationHistory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { applicationId } = req.params;

      const history = await this.applicationService.getApplicationStatusHistory(applicationId);

      res.json({
        success: true,
        data: { history },
        count: history.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get history error:', error);
      next(error);
    }
  };

  /**
   * Get application timeline (combined history and documents)
   * GET /applications/:applicationId/timeline
   */
  getApplicationTimeline = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { applicationId } = req.params;

      const timeline = await this.applicationService.getApplicationTimeline(applicationId);

      res.json({
        success: true,
        data: { timeline },
        count: timeline.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get timeline error:', error);
      next(error);
    }
  };

  // ==================== BULK OPERATIONS ====================

  /**
   * Apply to multiple jobs in bulk
   * POST /applications/bulk/apply
   */
  bulkApplyToJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const { jobIds, commonData } = req.body;

      const result = await this.applicationService.bulkApplyToJobs({
        jobIds,
        applicantId: userId,
        commonData: {
          ...commonData,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        },
      });

      res.status(201).json({
        success: true,
        message: `Applied to ${result.successful.length} jobs${result.failed.length > 0 ? `, ${result.failed.length} failed` : ''}`,
        data: {
          successful: result.successful,
          failed: result.failed,
        },
        stats: {
          successCount: result.successful.length,
          failureCount: result.failed.length,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Bulk apply error:', error);
      next(error);
    }
  };

  /**
   * Bulk update application statuses
   * PATCH /applications/bulk/status
   */
  bulkUpdateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const { applicationIds, status, reason } = req.body;
      const changedBy = req.headers['x-user-id'] as string;

      const result = await this.applicationService.bulkUpdateStatus(
        applicationIds,
        status,
        changedBy,
        reason,
      );

      res.json({
        success: true,
        message: `Updated ${result.updated} applications`,
        data: { failed: result.failed },
        stats: {
          updatedCount: result.updated,
          failureCount: result.failed.length,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Bulk update status error:', error);
      next(error);
    }
  };

  /**
   * Get applications with filtering and pagination
   * GET /applications
   */
  getApplicationsByFilter = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
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
      const limit = parseInt(req.query.limit as string) || 50;

      const filters = {
        status: req.query.status as ApplicationStatus | undefined,
        jobId: req.query.jobId as string | undefined,
        applicantId: req.query.applicantId as string | undefined,
        startupId: req.query.startupId as string | undefined,
        sortBy: (req.query.sortBy as 'newest' | 'oldest' | 'status' | 'quality') || 'newest',
      };

      const result = await this.applicationService.getApplicationsByFilter(filters, page, limit);

      res.json({
        success: true,
        data: {
          applications: result.applications,
          pagination: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
          },
          facets: result.facets,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get applications error:', error);
      next(error);
    }
  };

  // ==================== ANALYTICS ====================

  /**
   * Get application analytics
   * GET /applications/:applicationId/analytics
   */
  getApplicationAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { applicationId } = req.params;

      const analytics = await this.applicationService.getApplicationAnalytics(applicationId);

      if (!analytics) {
        res.status(404).json({
          success: false,
          message: 'Analytics not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        success: true,
        data: { analytics },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get analytics error:', error);
      next(error);
    }
  };

  /**
   * Get recruiting pipeline analytics
   * GET /analytics/pipeline
   */
  getPipelineAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const startupId = req.query.startupId as string;
      const jobId = req.query.jobId as string | undefined;

      if (!startupId) {
        res.status(400).json({
          success: false,
          message: 'startupId query parameter is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const analytics = await this.applicationService.getPipelineAnalytics(startupId, jobId);

      res.json({
        success: true,
        data: { analytics },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get pipeline analytics error:', error);
      next(error);
    }
  };

  /**
   * Get application quality metrics
   * GET /analytics/quality
   */
  getQualityMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const startupId = req.query.startupId as string;
      const jobId = req.query.jobId as string | undefined;

      if (!startupId) {
        res.status(400).json({
          success: false,
          message: 'startupId query parameter is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const metrics = await this.applicationService.getQualityMetrics(startupId, jobId);

      res.json({
        success: true,
        data: { metrics },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get quality metrics error:', error);
      next(error);
    }
  };

  // ==================== HELPER: GET MULTER MIDDLEWARE ====================

  /**
   * Returns multer middleware for file upload
   */
  static getUploadMiddleware() {
    return upload.single('file');
  }
}

export { upload };
