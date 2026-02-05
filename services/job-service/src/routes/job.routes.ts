import { Router } from 'express';
import { JobController } from '@/controllers/JobController';

const router = Router();
const jobController = new JobController();

// ==================== BASIC JOB CRUD ====================
router.post('/', JobController.createJobValidation, jobController.createJob);
router.get('/', JobController.searchJobsValidation, jobController.getJobs);
router.get('/featured', jobController.getFeaturedJobs);
router.get('/stats', jobController.getJobStats);
router.get('/startup/:startupId', jobController.getJobsByStartup);
router.get('/:id', jobController.getJobById);
router.get('/slug/:slug', jobController.getJobBySlug);
router.put('/:id', JobController.updateJobValidation, jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

// ==================== ADVANCED SEARCH ====================
router.get('/search/advanced', jobController.advancedSearch);
router.get('/search/basic', JobController.searchJobsValidation, jobController.searchJobs);

// ==================== RECOMMENDATIONS ====================
router.post('/recommendations/for-you', jobController.getRecommendations);
router.get('/recommendations/similar/:jobId', jobController.getSimilarJobs);
router.get('/recommendations/trending', jobController.getTrendingJobs);
router.get('/recommendations/missed', jobController.getMissedJobs);

// ==================== ANALYTICS & TRACKING ====================
router.post('/:jobId/track/view', jobController.trackJobView);
router.put('/track/view/:viewId/engagement', jobController.updateViewEngagement);
router.get('/:jobId/analytics', jobController.getJobAnalytics);
router.get('/analytics/startup/:startupId', jobController.getStartupAnalytics);
router.post('/:jobId/track/save', jobController.trackJobSave);
router.post('/:jobId/track/share', jobController.trackJobShare);
router.post('/:jobId/track/apply-click', jobController.trackApplyClick);

// ==================== SAVED JOBS ====================
router.post('/:jobId/save', jobController.saveJob);
router.delete('/:jobId/save', jobController.unsaveJob);
router.get('/saved/my-jobs', jobController.getSavedJobs);

export default router;
