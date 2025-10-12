import { Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { FundingService, InvestorFilters } from '@/services/FundingService';
import { logger } from '@/utils/logger';
import { InvestorType } from '@startup-platform/types';

export class InvestorController {
  private fundingService: FundingService;

  constructor() {
    this.fundingService = new FundingService();
  }

  // Validation rules
  static createInvestorValidation = [
    body('name').isLength({ min: 1, max: 200 }).withMessage('Name must be between 1 and 200 characters'),
    body('type').isIn(Object.values(InvestorType)).withMessage('Invalid investor type'),
    body('website').optional().isURL().withMessage('Invalid website URL'),
    body('email').optional().isEmail().withMessage('Invalid email address'),
    body('minInvestment').optional().isInt({ min: 0 }).withMessage('Minimum investment must be a positive integer'),
    body('maxInvestment').optional().isInt({ min: 0 }).withMessage('Maximum investment must be a positive integer'),
    body('fundSize').optional().isInt({ min: 0 }).withMessage('Fund size must be a positive integer'),
    body('investmentStages').optional().isArray().withMessage('Investment stages must be an array'),
    body('industries').optional().isArray().withMessage('Industries must be an array'),
    body('geographies').optional().isArray().withMessage('Geographies must be an array'),
  ];

  static updateInvestorValidation = [
    body('name').optional().isLength({ min: 1, max: 200 }).withMessage('Name must be between 1 and 200 characters'),
    body('type').optional().isIn(Object.values(InvestorType)).withMessage('Invalid investor type'),
    body('website').optional().isURL().withMessage('Invalid website URL'),
    body('email').optional().isEmail().withMessage('Invalid email address'),
    body('minInvestment').optional().isInt({ min: 0 }).withMessage('Minimum investment must be a positive integer'),
    body('maxInvestment').optional().isInt({ min: 0 }).withMessage('Maximum investment must be a positive integer'),
    body('fundSize').optional().isInt({ min: 0 }).withMessage('Fund size must be a positive integer'),
    body('investmentStages').optional().isArray().withMessage('Investment stages must be an array'),
    body('industries').optional().isArray().withMessage('Industries must be an array'),
    body('geographies').optional().isArray().withMessage('Geographies must be an array'),
  ];

  static getInvestorsValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('types').optional().custom((value) => {
      if (typeof value === 'string') {
        return Object.values(InvestorType).includes(value as InvestorType);
      }
      if (Array.isArray(value)) {
        return value.every(type => Object.values(InvestorType).includes(type));
      }
      return false;
    }).withMessage('Invalid investor types'),
    query('minInvestment').optional().isInt({ min: 0 }).withMessage('Minimum investment must be a positive integer'),
    query('maxInvestment').optional().isInt({ min: 0 }).withMessage('Maximum investment must be a positive integer'),
  ];

  createInvestor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const investor = await this.fundingService.createInvestor(req.body);

      res.status(201).json({
        success: true,
        message: 'Investor created successfully',
        data: { investor },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Create investor error:', error);
      next(error);
    }
  };

  updateInvestor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      const investor = await this.fundingService.updateInvestor(id, req.body);

      res.json({
        success: true,
        message: 'Investor updated successfully',
        data: { investor },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Update investor error:', error);
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

  getInvestorById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const investor = await this.fundingService.getInvestorById(id);

      if (!investor) {
        res.status(404).json({
          success: false,
          message: 'Investor not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        success: true,
        data: { investor },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get investor by ID error:', error);
      next(error);
    }
  };

  getInvestorBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const investor = await this.fundingService.getInvestorBySlug(slug);

      if (!investor) {
        res.status(404).json({
          success: false,
          message: 'Investor not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        success: true,
        data: { investor },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get investor by slug error:', error);
      next(error);
    }
  };

  getInvestors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const filters: InvestorFilters = {};
      if (req.query.search) filters.search = req.query.search as string;
      if (req.query.types) {
        filters.types = Array.isArray(req.query.types) 
          ? req.query.types as InvestorType[] 
          : [req.query.types as InvestorType];
      }
      if (req.query.industries) {
        filters.industries = Array.isArray(req.query.industries) 
          ? req.query.industries as string[] 
          : [req.query.industries as string];
      }
      if (req.query.geographies) {
        filters.geographies = Array.isArray(req.query.geographies) 
          ? req.query.geographies as string[] 
          : [req.query.geographies as string];
      }
      if (req.query.minInvestment) filters.minInvestment = parseInt(req.query.minInvestment as string);
      if (req.query.maxInvestment) filters.maxInvestment = parseInt(req.query.maxInvestment as string);
      if (req.query.isVerified) filters.isVerified = req.query.isVerified === 'true';
      if (req.query.isActivelyInvesting) filters.isActivelyInvesting = req.query.isActivelyInvesting === 'true';

      const { investors, total } = await this.fundingService.getInvestors(filters, page, limit);

      res.json({
        success: true,
        data: { investors },
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
      logger.error('Get investors error:', error);
      next(error);
    }
  };

  searchInvestors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const { q } = req.query;
      if (!q) {
        res.status(400).json({
          success: false,
          message: 'Search query is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const filters: InvestorFilters = {};
      if (req.query.types) {
        filters.types = Array.isArray(req.query.types) 
          ? req.query.types as InvestorType[] 
          : [req.query.types as InvestorType];
      }
      if (req.query.industries) {
        filters.industries = Array.isArray(req.query.industries) 
          ? req.query.industries as string[] 
          : [req.query.industries as string];
      }
      if (req.query.geographies) {
        filters.geographies = Array.isArray(req.query.geographies) 
          ? req.query.geographies as string[] 
          : [req.query.geographies as string];
      }

      const { investors, total } = await this.fundingService.searchInvestors(q as string, filters, page, limit);

      res.json({
        success: true,
        data: { investors },
        meta: {
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          searchQuery: q,
          filters,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Search investors error:', error);
      next(error);
    }
  };

  deleteInvestor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.fundingService.deleteInvestor(id);

      res.json({
        success: true,
        message: 'Investor deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Delete investor error:', error);
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

  getInvestorStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { investorId } = req.query;
      const stats = await this.fundingService.getInvestorStats(investorId as string);

      res.json({
        success: true,
        data: { stats },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get investor stats error:', error);
      next(error);
    }
  };

  getInvestorInvestments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const investments = await this.fundingService.getInvestmentsByInvestor(id);

      res.json({
        success: true,
        data: { investments },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get investor investments error:', error);
      next(error);
    }
  };
}