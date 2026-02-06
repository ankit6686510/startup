import { Router } from 'express';
import { InvestorController } from '@/controllers/InvestorController';

const router = Router();
const investorController = new InvestorController();

// Investor CRUD routes
router.post('/', InvestorController.createInvestorValidation, investorController.createInvestor);
router.get('/', InvestorController.getInvestorsValidation, investorController.getInvestors);
router.get(
  '/search',
  InvestorController.getInvestorsValidation,
  investorController.searchInvestors,
);
router.get('/stats', investorController.getInvestorStats);
router.get('/:id', investorController.getInvestorById);
router.get('/slug/:slug', investorController.getInvestorBySlug);
router.get('/:id/investments', investorController.getInvestorInvestments);
router.put('/:id', InvestorController.updateInvestorValidation, investorController.updateInvestor);
router.delete('/:id', investorController.deleteInvestor);

export default router;
