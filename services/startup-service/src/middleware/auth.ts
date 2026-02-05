import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from './errorHandler';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        verified: boolean;
      };
    }
  }
}

// JWT secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('Authorization header is required');
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

    if (!token) {
      throw new UnauthorizedError('Token is required');
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        verified: decoded.verified,
      };

      next();
    } catch (jwtError) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  } catch (error) {
    next(error);
  }
};

// Optional authentication (doesn't throw error if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            verified: decoded.verified,
          };
        } catch (jwtError) {
          // Invalid token, but don't throw error - just continue without user
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Authorization middleware - check user roles
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
    }

    next();
  };
};

// Check if user is verified
export const requireVerified = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (!req.user.verified) {
    throw new ForbiddenError('Email verification required');
  }

  next();
};

// Check if user owns the resource or is admin
export const requireOwnershipOrAdmin = (getUserIdFromParams: (req: Request) => string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const resourceUserId = getUserIdFromParams(req);
    const isOwner = req.user.id === resourceUserId;
    const isAdmin = ['admin', 'moderator'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('Access denied. You can only access your own resources.');
    }

    next();
  };
};

// Generate JWT token (utility function for authentication service)
export const generateToken = (user: {
  id: string;
  email: string;
  role: string;
  verified: boolean;
}) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    verified: user.verified,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: 'startupcompass-api',
    audience: 'startupcompass-users',
  } as any);
};

// Generate refresh token
export const generateRefreshToken = (userId: string) => {
  const payload = { userId, type: 'refresh' };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: 'startupcompass-api',
    audience: 'startupcompass-users',
  } as any);
};

// Verify refresh token
export const verifyRefreshToken = (token: string): { userId: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return { userId: decoded.userId };
  } catch (error) {
    throw new UnauthorizedError('Invalid refresh token');
  }
};

// API Key authentication (for external services)
export const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    throw new UnauthorizedError('API key is required');
  }

  // TODO: Implement proper API key validation
  // For now, just check against environment variable
  const validApiKey = process.env.API_KEY;

  if (!validApiKey || apiKey !== validApiKey) {
    throw new UnauthorizedError('Invalid API key');
  }

  // Set a fake user for API key requests
  req.user = {
    id: 'api-user',
    email: 'api@startupcompass.com',
    role: 'api',
    verified: true,
  };

  next();
};
