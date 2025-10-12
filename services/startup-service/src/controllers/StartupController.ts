import { Request, Response, NextFunction } from 'express';
import { StartupService } from '../services/StartupService';
import { 
  GetStartupsRequest,
  CreateStartupRequest,
  UpdateStartupRequest,
  ApiResponse,
  Industry
} from '@startup-platform/types';
import { 
  validateCreateStartupRequest,
  validateUpdateStartupRequest 
} from '@startup-platform/types';
import { ValidationError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class StartupController {
  private startupService: StartupService;

  constructor() {
    this.startupService = new StartupService();
  }

  getAllStartups = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params: GetStartupsRequest = {
        page: parseInt(req.query.page as string) || 1,
        limit: Math.min(parseInt(req.query.limit as string) || 20, 100),
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        search: req.query.search as string,
        industry: req.query.industry ? (Array.isArray(req.query.industry) ? req.query.industry : [req.query.industry]) as Industry[] : undefined,
        status: req.query.status ? (Array.isArray(req.query.status) ? req.query.status : [req.query.status]) as any[] : undefined,
        foundedAfter: req.query.foundedAfter ? new Date(req.query.foundedAfter as string) : undefined,
        foundedBefore: req.query.foundedBefore ? new Date(req.query.foundedBefore as string) : undefined,
        minFunding: req.query.minFunding ? parseInt(req.query.minFunding as string) : undefined,
        maxFunding: req.query.maxFunding ? parseInt(req.query.maxFunding as string) : undefined,
        verified: req.query.verified !== undefined ? req.query.verified === 'true' : undefined,
        hasJobs: req.query.hasJobs !== undefined ? req.query.hasJobs === 'true' : undefined,
        location: req.query.countries ? {
          countries: Array.isArray(req.query.countries) ? req.query.countries as string[] : [req.query.countries as string]
        } : undefined
      };

      const result = await this.startupService.getAllStartups(params);

      const response: ApiResponse = {
        success: true,
        data: result,
        timestamp: new Date(),
        meta: {
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
          filters: {
            industry: params.industry,
            status: params.status,
            verified: params.verified,
            hasJobs: params.hasJobs
          }
        }
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getStartupById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.startupService.getStartupById(id);

      const response: ApiResponse = {
        success: true,
        data: result,
        timestamp: new Date()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getStartupBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const result = await this.startupService.getStartupBySlug(slug);

      const response: ApiResponse = {
        success: true,
        data: result,
        timestamp: new Date()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  createStartup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body
      const validation = validateCreateStartupRequest(req.body);
      if (!validation.success) {
        const firstError = validation.error.errors[0];
        throw new ValidationError(
          firstError.message,
          firstError.path?.join('.') || 'unknown'
        );
      }

      const data: CreateStartupRequest = validation.data;
      const startup = await this.startupService.createStartup(data);

      const response: ApiResponse = {
        success: true,
        data: { startup, message: 'Startup created successfully' },
        timestamp: new Date()
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateStartup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Validate request body
      const validation = validateUpdateStartupRequest({ ...req.body, id });
      if (!validation.success) {
        const firstError = validation.error.errors[0];
        throw new ValidationError(
          firstError.message,
          firstError.path?.join('.') || 'unknown'
        );
      }

      const data: UpdateStartupRequest = validation.data;
      const startup = await this.startupService.updateStartup(id, data);

      const response: ApiResponse = {
        success: true,
        data: { startup, message: 'Startup updated successfully' },
        timestamp: new Date()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteStartup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.startupService.deleteStartup(id);

      const response: ApiResponse = {
        success: true,
        message: 'Startup deleted successfully',
        timestamp: new Date()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getStartupsByIndustry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { industry } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!Object.values(Industry).includes(industry as Industry)) {
        throw new ValidationError('Invalid industry');
      }

      const startups = await this.startupService.getStartupsByIndustry(industry as Industry, limit);

      const response: ApiResponse = {
        success: true,
        data: startups,
        timestamp: new Date()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getFeaturedStartups = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const startups = await this.startupService.getFeaturedStartups(limit);

      const response: ApiResponse = {
        success: true,
        data: startups,
        timestamp: new Date()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getStartupStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.startupService.getStartupStats();

      const response: ApiResponse = {
        success: true,
        data: stats,
        timestamp: new Date()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  // Search startups (could be moved to a separate search service later)
  searchStartups = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length === 0) {
        throw new ValidationError('Search query is required');
      }

      const params: GetStartupsRequest = {
        page: parseInt(req.query.page as string) || 1,
        limit: Math.min(parseInt(req.query.limit as string) || 20, 50),
        search: query,
        industry: req.query.industry ? (Array.isArray(req.query.industry) ? req.query.industry : [req.query.industry]) as Industry[] : undefined,
        verified: req.query.verified !== undefined ? req.query.verified === 'true' : undefined
      };

      const result = await this.startupService.getAllStartups(params);

      const response: ApiResponse = {
        success: true,
        data: result,
        timestamp: new Date(),
        meta: {
          searchQuery: query,
          searchTime: Date.now() // Could be calculated properly
        }
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
