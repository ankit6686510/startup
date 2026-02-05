import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { Repository } from 'typeorm';
import { AppDataSource } from '@/config/database';
import { User } from '@/models/User';
import { UserProfile } from '@/models/UserProfile';
import { logger } from '@/utils/logger';

export class UserController {
  private userRepository: Repository<User>;
  private profileRepository: Repository<UserProfile>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.profileRepository = AppDataSource.getRepository(UserProfile);
  }

  // Validation rules
  static updateProfileValidation = [
    body('firstName')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('First name must be between 1 and 100 characters'),
    body('lastName')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Last name must be between 1 and 100 characters'),
    body('displayName')
      .optional()
      .isLength({ min: 1, max: 200 })
      .withMessage('Display name must be between 1 and 200 characters'),
    body('bio')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Bio must be less than 1000 characters'),
    body('title')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Title must be less than 100 characters'),
    body('company')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Company must be less than 200 characters'),
    body('location')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Location must be less than 100 characters'),
    body('website')
      .optional()
      .isURL()
      .withMessage('Please provide a valid URL'),
    body('phone')
      .optional()
      .isMobilePhone('any')
      .withMessage('Please provide a valid phone number'),
    body('skills')
      .optional()
      .isArray()
      .withMessage('Skills must be an array'),
    body('interests')
      .optional()
      .isArray()
      .withMessage('Interests must be an array'),
    body('industries')
      .optional()
      .isArray()
      .withMessage('Industries must be an array'),
  ];

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['profile'],
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            emailVerified: user.emailVerified,
            emailVerifiedAt: user.emailVerifiedAt,
            lastLoginAt: user.lastLoginAt,
            twoFactorEnabled: user.twoFactorEnabled,
            preferences: user.preferences,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            profile: user.profile,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get user error:', error);
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['profile'],
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Return only public profile information
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            role: user.role,
            profile: user.profile ? {
              displayName: user.profile.displayName,
              bio: user.profile.bio,
              title: user.profile.title,
              company: user.profile.company,
              location: user.profile.location,
              website: user.profile.website,
              socialLinks: user.profile.socialLinks,
              skills: user.profile.skills,
              interests: user.profile.interests,
              industries: user.profile.industries,
              isPublic: user.profile.isPublic,
            } : null,
            createdAt: user.createdAt,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get user by ID error:', error);
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['profile'],
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Update or create profile
      let profile = user.profile;
      if (!profile) {
        profile = this.profileRepository.create({ user: { id: userId } as any });
      }

      // Update profile fields
      const {
        firstName,
        lastName,
        displayName,
        bio,
        title,
        company,
        location,
        website,
        phone,
        birthday,
        gender,
        timezone,
        socialLinks,
        skills,
        interests,
        industries,
        yearsOfExperience,
        investmentRangeMin,
        investmentRangeMax,
        contactPreferences,
        isPublic,
        isSearchable,
      } = req.body;

      Object.assign(profile, {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(title !== undefined && { title }),
        ...(company !== undefined && { company }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(phone !== undefined && { phone }),
        ...(birthday !== undefined && { birthday }),
        ...(gender !== undefined && { gender }),
        ...(timezone !== undefined && { timezone }),
        ...(socialLinks !== undefined && { socialLinks }),
        ...(skills !== undefined && { skills }),
        ...(interests !== undefined && { interests }),
        ...(industries !== undefined && { industries }),
        ...(yearsOfExperience !== undefined && { yearsOfExperience }),
        ...(investmentRangeMin !== undefined && { investmentRangeMin }),
        ...(investmentRangeMax !== undefined && { investmentRangeMax }),
        ...(contactPreferences !== undefined && { contactPreferences }),
        ...(isPublic !== undefined && { isPublic }),
        ...(isSearchable !== undefined && { isSearchable }),
      });

      // Calculate profile completion
      profile.calculateCompletionPercentage();

      const savedProfile = await this.profileRepository.save(profile);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          profile: savedProfile,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      next(error);
    }
  };

  updatePreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { preferences } = req.body;

      // Merge with existing preferences
      user.preferences = {
        ...user.preferences,
        ...preferences,
      };

      await this.userRepository.save(user);

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: {
          preferences: user.preferences,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Update preferences error:', error);
      next(error);
    }
  };

  searchUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        q,
        role,
        skills,
        industries,
        location,
        page = 1,
        limit = 20,
      } = req.query;

      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.profile', 'profile')
        .where('user.status = :status', { status: 'active' })
        .andWhere('profile.isPublic = :isPublic', { isPublic: true })
        .andWhere('profile.isSearchable = :isSearchable', { isSearchable: true });

      // Search by name, title, or bio
      if (q) {
        queryBuilder.andWhere(
          '(profile.firstName ILIKE :query OR profile.lastName ILIKE :query OR profile.displayName ILIKE :query OR profile.title ILIKE :query OR profile.bio ILIKE :query)',
          { query: `%${q}%` }
        );
      }

      // Filter by role
      if (role) {
        queryBuilder.andWhere('user.role = :role', { role });
      }

      // Filter by skills
      if (skills) {
        const skillsArray = Array.isArray(skills) ? skills : [skills];
        queryBuilder.andWhere('profile.skills && :skills', { skills: skillsArray });
      }

      // Filter by industries
      if (industries) {
        const industriesArray = Array.isArray(industries) ? industries : [industries];
        queryBuilder.andWhere('profile.industries && :industries', { industries: industriesArray });
      }

      // Filter by location
      if (location) {
        queryBuilder.andWhere('profile.location ILIKE :location', { location: `%${location}%` });
      }

      // Pagination
      const offset = (Number(page) - 1) * Number(limit);
      queryBuilder.skip(offset).take(Number(limit));

      const [users, total] = await queryBuilder.getManyAndCount();

      res.json({
        success: true,
        data: {
          users: users.map(user => ({
            id: user.id,
            role: user.role,
            profile: user.profile ? {
              displayName: user.profile.displayName,
              bio: user.profile.bio,
              title: user.profile.title,
              company: user.profile.company,
              location: user.profile.location,
              website: user.profile.website,
              socialLinks: user.profile.socialLinks,
              skills: user.profile.skills,
              interests: user.profile.interests,
              industries: user.profile.industries,
            } : null,
            createdAt: user.createdAt,
          })),
        },
        meta: {
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Search users error:', error);
      next(error);
    }
  };

  deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Soft delete or anonymize user data
      user.email = `deleted_${Date.now()}@example.com`;
      user.status = 'inactive' as any;

      await this.userRepository.save(user);

      res.json({
        success: true,
        message: 'Account deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Delete account error:', error);
      next(error);
    }
  };
}