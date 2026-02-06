import { Router } from 'express';
import { CompanyController } from '../controllers/CompanyController';
import { FeedController } from '../controllers/FeedController';
import { FinancialController } from '../controllers/FinancialController';
import { authenticate } from '../middleware/auth';

const router = Router({ mergeParams: true }); // Enable access to :startupId from parent router if nested

const companyController = new CompanyController();
const feedController = new FeedController();
const financialController = new FinancialController();

// --- Team / RBAC ---
router.get('/:id/members', companyController.getMembers);
router.post('/:id/members', authenticate, companyController.addMember);
router.delete('/:id/members/:userId', authenticate, companyController.removeMember);

// --- Feed / Channel ---
router.get('/:id/feed', feedController.getFeed);
router.post('/:id/feed', authenticate, feedController.createPost);

// --- Financials ---
router.get('/:id/financials', authenticate, financialController.getFinancials); // Authenticate for verified investor checks
router.post('/:id/financials', authenticate, financialController.addFinancialReport);

// --- Milestones ---
router.get('/:id/milestones', financialController.getMilestones);
router.post('/:id/milestones', authenticate, financialController.addMilestone);

export default router;
