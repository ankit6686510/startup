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

/**
 * Authentication middleware
 */
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedError('Authorization header is required');
        }

        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader;

        if (!token) {
            throw new UnauthorizedError('Token is required');
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as any;
            req.user = {
                id: decoded.id || decoded.userId,
                email: decoded.email,
                role: decoded.role,
                verified: decoded.verified
            };

            next();
        } catch (jwtError) {
            throw new UnauthorizedError('Invalid or expired token');
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Authorization middleware - check user roles
 */
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
