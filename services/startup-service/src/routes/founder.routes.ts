import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Founder } from '../models/Founder';
import { ValidationError, NotFoundError } from '../middleware/errorHandler';
import { ApiResponse } from '@startup-platform/types';

const router = Router();
const founderRepository = AppDataSource.getRepository(Founder);

// GET /api/v1/founders/:startupId - Get founders by startup ID
router.get('/:startupId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startupId } = req.params;

    if (!startupId) {
      throw new ValidationError('Startup ID is required');
    }

    const founders = await founderRepository.find({
      where: { startupId },
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });

    const response: ApiResponse = {
      success: true,
      data: founders,
      timestamp: new Date(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/founders/detail/:id - Get founder by ID
router.get('/detail/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const founder = await founderRepository.findOne({
      where: { id },
      relations: ['startup'],
    });

    if (!founder) {
      throw new NotFoundError('Founder not found');
    }

    const response: ApiResponse = {
      success: true,
      data: founder,
      timestamp: new Date(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/founders/:id - Update founder
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const founder = await founderRepository.findOne({ where: { id } });
    if (!founder) {
      throw new NotFoundError('Founder not found');
    }

    // Update allowed fields
    const allowedFields = [
      'name',
      'title',
      'bio',
      'email',
      'linkedinUrl',
      'twitterUrl',
      'imageUrl',
      'equity',
    ];
    const updateData: Partial<Founder> = {};

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        (updateData as any)[field] = updates[field];
      }
    });

    await founderRepository.update(id, updateData);
    const updatedFounder = await founderRepository.findOne({ where: { id } });

    const response: ApiResponse = {
      success: true,
      data: { founder: updatedFounder, message: 'Founder updated successfully' },
      timestamp: new Date(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
