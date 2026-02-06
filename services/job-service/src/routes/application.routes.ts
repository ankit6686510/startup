import { Router } from 'express';
import { ApplicationController, upload } from '@/controllers/EnhancedApplicationController';
import { authenticateJWT } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();
const controller = new ApplicationController();

// ==================== DOCUMENT MANAGEMENT ====================

/**
 * POST /:applicationId/documents
 * Upload resume/document for application
 */
router.post(
  '/:applicationId/documents',
  authenticateJWT,
  upload.single('file'),
  ApplicationController.uploadDocumentValidation,
  asyncHandler(controller.uploadDocument.bind(controller)),
);

/**
 * GET /:applicationId/documents
 * Get application documents
 */
router.get(
  '/:applicationId/documents',
  authenticateJWT,
  asyncHandler(controller.getApplicationDocuments.bind(controller)),
);

/**
 * DELETE /:applicationId/documents/:documentId
 * Delete application document
 */
router.delete(
  '/:applicationId/documents/:documentId',
  authenticateJWT,
  asyncHandler(controller.deleteDocument.bind(controller)),
);

// ==================== STATUS MANAGEMENT ====================

/**
 * PATCH /:applicationId/status
 * Update application status
 */
router.patch(
  '/:applicationId/status',
  authenticateJWT,
  ApplicationController.updateStatusValidation,
  asyncHandler(controller.updateApplicationStatus.bind(controller)),
);

/**
 * GET /:applicationId/history
 * Get application status history
 */
router.get(
  '/:applicationId/history',
  authenticateJWT,
  asyncHandler(controller.getApplicationHistory.bind(controller)),
);

/**
 * GET /:applicationId/timeline
 * Get application timeline (combined history and documents)
 */
router.get(
  '/:applicationId/timeline',
  authenticateJWT,
  asyncHandler(controller.getApplicationTimeline.bind(controller)),
);

// ==================== BULK OPERATIONS ====================

/**
 * POST /bulk/apply
 * Apply to multiple jobs in bulk
 */
router.post(
  '/bulk/apply',
  authenticateJWT,
  ApplicationController.bulkApplyValidation,
  asyncHandler(controller.bulkApplyToJobs.bind(controller)),
);

/**
 * PATCH /bulk/status
 * Bulk update application statuses
 */
router.patch(
  '/bulk/status',
  authenticateJWT,
  ApplicationController.bulkUpdateStatusValidation,
  asyncHandler(controller.bulkUpdateStatus.bind(controller)),
);

/**
 * GET /
 * Get applications with filtering and pagination
 */
router.get(
  '/',
  authenticateJWT,
  ApplicationController.filterValidation,
  asyncHandler(controller.getApplicationsByFilter.bind(controller)),
);

// ==================== ANALYTICS ====================

/**
 * GET /:applicationId/analytics
 * Get application analytics
 */
router.get(
  '/:applicationId/analytics',
  authenticateJWT,
  asyncHandler(controller.getApplicationAnalytics.bind(controller)),
);

/**
 * GET /analytics/pipeline
 * Get recruiting pipeline analytics
 */
router.get(
  '/analytics/pipeline',
  authenticateJWT,
  asyncHandler(controller.getPipelineAnalytics.bind(controller)),
);

/**
 * GET /analytics/quality
 * Get application quality metrics
 */
router.get(
  '/analytics/quality',
  authenticateJWT,
  asyncHandler(controller.getQualityMetrics.bind(controller)),
);

export default router;
