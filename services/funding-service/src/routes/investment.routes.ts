import { Router } from 'express';
import { InvestmentController } from '@/controllers/InvestmentController';

const router = Router();
const investmentController = new InvestmentController();

// Investment routes
router.post(
  '/',
  InvestmentController.createInvestmentValidation,
  investmentController.createInvestment,
);
router.get('/funding-round/:fundingRoundId', investmentController.getInvestmentsByFundingRound);
router.get('/investor/:investorId', investmentController.getInvestmentsByInvestor);

export default router;
