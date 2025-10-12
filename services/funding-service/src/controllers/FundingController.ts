import { Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { FundingService, FundingRoundFilters } from '@/services/FundingService';
import { logger } from '@/utils/logger';
import { 
  FundingRound as FundingRoundType, 
  Currency 
} from '@startup-platform/types';

export class FundingController {
  private fundingService: FundingService;

  constructor() {
    this.fundingService = new FundingService();
  }

  // Validation rules
  static createFundingRoundValidation = [
    body('startupId').notEmpty().withMessage('Startup ID is required'),
    body('roundType').isIn(Object.values(FundingRoundType)).withMessage('Invalid funding round type'),
    body('amount').isInt({ min: 1 }).withMessage('Amount must be a positive integer'),
    body('currency').optional().isIn(Object.values(Currency)).withMessage('Invalid currency'),
    body('preMoneyValuation').optional().isInt({ min: 0 }).withMessage('Pre-money valuation must be a positive integer'),
    body('postMoneyValuation').optional().isInt({ min: 0 }).withMessage('Post-money valuation must be a positive integer'),
    body('announcedDate').optional().isISO8601().withMessage('Invalid announced date'),
    body('closedDate').optional().isISO8601().withMessage('Invalid closed date'),
  ];

  static updateFundingRoundValidation = [
    body('roundType').optional().isIn(Object.values(FundingRoundType)).withMessage('Invalid funding round type'),
    body('amount').optional().isInt({ min: 1 }).withMessage('Amount must be a positive integer'),
    body('currency').optional().isIn(Object.values(Currency)).withMessage('Invalid currency'),
    body('preMoneyValuation').optional().isInt({ min: 0 }).withMessage('Pre-money valuation must be a positive integer'),
    body('postMoneyValuation').optional().isInt({ min: 0 }).withMessage('Post-money valuation must be a positive integer'),
    body('announcedDate').optional().isISO8601().withMessage('Invalid announced date'),
    body('closedDate').optional().isISO8601().withMessage('Invalid closed date'),
  ];

  static getFundingRoundsValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('roundTypes').optional().custom((value) => {
      if (typeof value === 'string') {
        return Object.values(FundingRoundType).includes(value as FundingRoundType);
      }
      if (Array.isArray(value)) {
        return value.every(type => Object.values(FundingRoundType).includes(type));
      }
      return false;
    }).withMessage('Invalid round types'),
    query('currency').optional().isIn(Object.values(Currency)).withMessage('Invalid currency'),
    query('minAmount').optional().isInt({ min: 0 }).withMessage('Minimum amount must be a positive integer'),
    query('maxAmount').optional().isInt({ min: 0 }).withMessage('Maximum amount must be a positive integer'),
  ];

  createFundingRound = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const fundingRound = await this.fundingService.createFundingRound(req.body);

      res.status(201).json({
        success: true,
        message: 'Funding round created successfully',
        data: { fundingRound },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Create funding round error:', error);
      next(error);
    }
  };

  updateFundingRound = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const { id } = req.params;
      const fundingRound = await this.fundingService.updateFundingRound(id, req.body);

      res.json({
        success: true,
        message: 'Funding round updated successfully',
        data: { fundingRound },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Update funding round error:', error);
      if (error instanceof Error) {
        res.status(404).json({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        next(error);
      }
    }
  };

  getFundingRoundById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const fundingRound = await this.fundingService.getFundingRoundById(id);

      if (!fundingRound) {
        res.status(404).json({
          success: false,
          message: 'Funding round not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        success: true,
        data: { fundingRound },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get funding round by ID error:', error);
      next(error);
    }
  };

  getFundingRounds = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const filters: FundingRoundFilters = {};
      if (req.query.startupIds) {
        filters.startupIds = Array.isArray(req.query.startupIds) 
          ? req.query.startupIds as string[] 
          : [req.query.startupIds as string];
      }
      if (req.query.roundTypes) {
        filters.roundTypes = Array.isArray(req.query.roundTypes) 
          ? req.query.roundTypes as FundingRoundType[] 
          : [req.query.roundTypes as FundingRoundType];
      }
      if (req.query.minAmount) filters.minAmount = parseInt(req.query.minAmount as string);
      if (req.query.maxAmount) filters.maxAmount = parseInt(req.query.maxAmount as string);
      if (req.query.currency) filters.currency = req.query.currency as Currency;
      if (req.query.dateFrom) filters.dateFrom = new Date(req.query.dateFrom as string);
      if (req.query.dateTo) filters.dateTo = new Date(req.query.dateTo as string);
      if (req.query.isConfirmed) filters.isConfirmed = req.query.isConfirmed === 'true';
      if (req.query.investorIds) {
        filters.investorIds = Array.isArray(req.query.investorIds) 
          ? req.query.investorIds as string[] 
          : [req.query.investorIds as string];
      }

      const { rounds, total } = await this.fundingService.getFundingRounds(filters, page, limit);

      res.json({
        success: true,
        data: { rounds },
        meta: {
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          filters,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get funding rounds error:', error);
      next(error);
    }
  };

  getFundingRoundsByStartup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startupId } = req.params;
      const rounds = await this.fundingService.getFundingRoundsByStartup(startupId);

      res.json({
        success: true,
        data: { rounds },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get funding rounds by startup error:', error);
      next(error);
    }
  };

  getRecentFundingRounds = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const rounds = await this.fundingService.getRecentFundingRounds(limit);

      res.json({
        success: true,
        data: { rounds },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get recent funding rounds error:', error);
      next(error);
    }
  };

  deleteFundingRound = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.fundingService.deleteFundingRound(id);

      res.json({
        success: true,
        message: 'Funding round deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Delete funding round error:', error);
      if (error instanceof Error) {
        res.status(404).json({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        next(error);
      }
    }
  };

  getFundingStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startupId } = req.query;
      const stats = await this.fundingService.getFundingStats(startupId as string);

      res.json({
        success: true,
        data: { stats },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get funding stats error:', error);
      next(error);
    }
  };

  getFundingTrends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { period, industry, geography } = req.query;
      const trends = await this.fundingService.getFundingTrends(
        period as 'monthly' | 'quarterly' | 'yearly',
        industry as string,
        geography as string
      );

      res.json({
        success: true,
        data: { trends },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get funding trends error:', error);
      next(error);
    }
  };

  getValuationBenchmarks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { industry, stage } = req.query;
      
      if (!industry) {
        res.status(400).json({
          success: false,
          message: 'Industry parameter is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const benchmarks = await this.fundingService.getValuationBenchmarks(
        industry as string,
        stage as string
      );

      res.json({
        success: true,
        data: { benchmarks },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get valuation benchmarks error:', error);
      next(error);
    }
  };
}