import { Router } from 'express';
import { StartupController } from '../controllers/StartupController';

const router = Router();
const startupController = new StartupController();

// GET /api/v1/startups - Get all startups with filtering and pagination
router.get('/', startupController.getAllStartups);

// GET /api/v1/startups/search - Search startups
router.get('/search', startupController.searchStartups);

// GET /api/v1/startups/featured - Get featured startups
router.get('/featured', startupController.getFeaturedStartups);

// GET /api/v1/startups/stats - Get startup statistics
router.get('/stats', startupController.getStartupStats);

// GET /api/v1/startups/industry/:industry - Get startups by industry
router.get('/industry/:industry', startupController.getStartupsByIndustry);

// GET /api/v1/startups/:id - Get startup by ID
router.get('/:id', startupController.getStartupById);

// GET /api/v1/startups/slug/:slug - Get startup by slug
router.get('/slug/:slug', startupController.getStartupBySlug);

// POST /api/v1/startups - Create new startup
router.post('/', startupController.createStartup);

// PUT /api/v1/startups/:id - Update startup
router.put('/:id', startupController.updateStartup);

// DELETE /api/v1/startups/:id - Delete startup
router.delete('/:id', startupController.deleteStartup);

export default router;
