import { Request, Response, NextFunction } from 'express';
import { FeedService } from '../services/FeedService';
import { CompanyService } from '../services/CompanyService';
import { StartupRole } from '../models/StartupMember';
import { ForbiddenError } from '../middleware/errorHandler';

export class FeedController {
    private feedService: FeedService;
    private companyService: CompanyService;

    constructor() {
        this.feedService = new FeedService();
        this.companyService = new CompanyService();
    }

    createPost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params; // startupId
            const userId = req.user?.id;

            if (!userId) throw new ForbiddenError('Not authenticated');

            // Check if user is EDITOR or above
            const canPost = await this.companyService.checkPermission(userId, id, StartupRole.EDITOR);
            if (!canPost) throw new ForbiddenError('Insufficient permissions to post updates');

            const post = await this.feedService.createPost(id, userId, req.body);

            res.status(201).json({
                success: true,
                data: post,
            });
        } catch (error) {
            next(error);
        }
    };

    getFeed = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            // In a real scenario we'd check if user is an investor/team member via CompanyService to determine visibility
            // For simplified scope, we assume Public unless specific role logic is added
            const posts = await this.feedService.getStartupFeed(id);

            res.json({
                success: true,
                data: posts,
            });
        } catch (error) {
            next(error);
        }
    };
}
