import { Router } from 'express';
import { ApplicationController } from '@/controllers/ApplicationController';

const router = Router();
const applicationController = new ApplicationController();

// Application routes
router.post('/', ApplicationController.applyToJobValidation, applicationController.applyToJob);
router.get('/user', applicationController.getUserApplications);
router.get('/job/:jobId', applicationController.getJobApplications);
router.put('/:applicationId/status', ApplicationController.updateApplicationStatusValidation, applicationController.updateApplicationStatus);

// Saved jobs routes
router.post('/jobs/:jobId/save', applicationController.saveJob);
router.delete('/jobs/:jobId/save', applicationController.unsaveJob);
router.get('/saved-jobs', applicationController.getUserSavedJobs);

// Job alerts routes
router.post('/alerts', applicationController.createJobAlert);
router.get('/alerts', applicationController.getUserJobAlerts);
router.put('/alerts/:alertId', applicationController.updateJobAlert);
router.delete('/alerts/:alertId', applicationController.deleteJobAlert);

export default router;