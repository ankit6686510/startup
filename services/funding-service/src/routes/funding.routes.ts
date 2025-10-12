import { Router } from 'express';
import { FundingController } from '@/controllers/FundingController';

const router = Router();
const fundingController = new FundingController();

// Funding round CRUD routes
router.post('/', FundingController.createFundingRoundValidation, fundingController.createFundingRound);
router.get('/', FundingController.getFundingRoundsValidation, fundingController.getFundingRounds);
router.get('/recent', fundingController.getRecentFundingRounds);
router.get('/stats', fundingController.getFundingStats);
router.get('/trends', fundingController.getFundingTrends);
router.get('/benchmarks', fundingController.getValuationBenchmarks);
router.get('/startup/:startupId', fundingController.getFundingRoundsByStartup);
router.get('/:id', fundingController.getFundingRoundById);
router.put('/:id', FundingController.updateFundingRoundValidation, fundingController.updateFundingRound);
router.delete('/:id', fundingController.deleteFundingRound);

export default router;