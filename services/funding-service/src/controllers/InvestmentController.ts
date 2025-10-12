import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { FundingService } from '@/services/FundingService';
import { logger } from '@/utils/logger';
import { Currency } from '@startup-platform/types';

export class InvestmentController {
  private fundingService: FundingService;

  constructor() {
    this.fundingService = new FundingService();
  }

  // Validation rules
  static createInvestmentValidation = [
    body('fundingRoundId').notEmpty().withMessage('Funding round ID is required'),
    body('investorId').notEmpty().withMessage('Investor ID is required'),
    body('amount').optional().isInt({ min: 1 }).withMessage('Amount must be a positive integer'),
    body('currency').optional().isIn(Object.values(Currency)).withMessage('Invalid currency'),
    body('sharesAcquired').optional().isInt({ min: 0 }).withMessage('Shares acquired must be a positive integer'),
    body('ownershipPercentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Ownership percentage must be between 0 and 100'),
    body('pricePerShare').optional().isFloat({ min: 0 }).withMessage('Price per share must be a positive number'),
    body('investmentDate').optional().isISO8601().withMessage('Invalid investment date'),
    body('isLeadInvestor').optional().isBoolean().withMessage('Is lead investor must be a boolean'),
    body('isFollowOn').optional().isBoolean().withMessage('Is follow-on must be a boolean'),
    body('boardSeats').optional().isInt({ min: 0 }).withMessage('Board seats must be a positive integer'),
  ];

  createInvestment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const investment = await this.fundingService.createInvestment(req.body);

      res.status(201).json({
        success: true,
        message: 'Investment created successfully',
        data: { investment },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Create investment error:', error);
      next(error);
    }
  };

  getInvestmentsByFundingRound = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fundingRoundId } = req.params;
      const investments = await this.fundingService.getInvestmentsByFundingRound(fundingRoundId);

      res.json({
        success: true,
        data: { investments },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get investments by funding round error:', error);
      next(error);
    }
  };

  getInvestmentsByInvestor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { investorId } = req.params;
      const investments = await this.fundingService.getInvestmentsByInvestor(investorId);

      res.json({
        success: true,
        data: { investments },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get investments by investor error:', error);
      next(error);
    }
  };
}