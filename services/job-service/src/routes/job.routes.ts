import { Router } from 'express';
import { JobController } from '@/controllers/JobController';

const router = Router();
const jobController = new JobController();

// Job CRUD routes
router.post('/', JobController.createJobValidation, jobController.createJob);
router.get('/', JobController.searchJobsValidation, jobController.getJobs);
router.get('/featured', jobController.getFeaturedJobs);
router.get('/search', JobController.searchJobsValidation, jobController.searchJobs);
router.get('/stats', jobController.getJobStats);
router.get('/startup/:startupId', jobController.getJobsByStartup);
router.get('/:id', jobController.getJobById);
router.get('/slug/:slug', jobController.getJobBySlug);
router.put('/:id', JobController.updateJobValidation, jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

export default router;