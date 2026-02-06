import { Request, Response, NextFunction } from 'express';
import { CompanyService } from '../services/CompanyService';
import { StartupRole } from '../models/StartupMember';
import { ValidationError, ForbiddenError } from '../middleware/errorHandler';

export class CompanyController {
    private companyService: CompanyService;

    constructor() {
        this.companyService = new CompanyService();
    }

    // GET /startups/:id/members
    getMembers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const members = await this.companyService.getMembers(id);
            res.json({
                success: true,
                data: members,
            });
        } catch (error) {
            next(error);
        }
    };

    // POST /startups/:id/members
    addMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { userId, role } = req.body;
            const inviterId = req.user?.id; // Assuming AuthMiddleware populates this

            if (!inviterId) throw new ForbiddenError('Not authenticated');

            // Check permissions
            const canManage = await this.companyService.checkPermission(inviterId, id, StartupRole.ADMIN);
            if (!canManage) throw new ForbiddenError('Insufficient permissions to manage team');

            const member = await this.companyService.addMember(id, userId, role || StartupRole.VIEWER, inviterId);

            res.status(201).json({
                success: true,
                data: member,
            });
        } catch (error) {
            next(error);
        }
    };

    // DELETE /startups/:id/members/:userId
    removeMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, userId } = req.params;
            const removerId = req.user?.id;

            if (!removerId) throw new ForbiddenError('Not authenticated');

            const canManage = await this.companyService.checkPermission(removerId, id, StartupRole.ADMIN);
            if (!canManage) throw new ForbiddenError('Insufficient permissions');

            await this.companyService.removeMember(id, userId);

            res.status(200).json({
                success: true,
                message: 'Member removed successfully',
            });
        } catch (error) {
            next(error);
        }
    };
}
