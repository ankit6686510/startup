import { Request, Response, NextFunction } from 'express';
import { FinancialService } from '../services/FinancialService';
import { CompanyService } from '../services/CompanyService';
import { StartupRole } from '../models/StartupMember';
import { AccessLevel } from '../models/StartupFinancials';
import { ForbiddenError } from '../middleware/errorHandler';

export class FinancialController {
    private financialService: FinancialService;
    private companyService: CompanyService;

    constructor() {
        this.financialService = new FinancialService();
        this.companyService = new CompanyService();
    }

    // FINANCIALS

    getFinancials = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            let accessLevel = AccessLevel.PUBLIC;

            if (userId) {
                // Check if team member
                const isTeam = await this.companyService.checkPermission(userId, id, StartupRole.VIEWER);
                if (isTeam) {
                    accessLevel = AccessLevel.PRIVATE; // Shows everything
                } else {
                    // Check if investor (This would normally require checking User Role or specific Investor relation)
                    // For now, let's assume if they are authenticated but not team, they might be investors
                    // In reality, we'd check: req.user.role === 'INVESTOR'
                    if (req.user?.role === 'INVESTOR') {
                        accessLevel = AccessLevel.VERIFIED_INVESTOR;
                    }
                }
            }

            const financials = await this.financialService.getFinancials(id, accessLevel);
            res.json({
                success: true,
                data: financials,
            });
        } catch (error) {
            next(error);
        }
    };

    addFinancialReport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            if (!userId) throw new ForbiddenError('Not authenticated');

            // Only Owner/Admin/CFO should add financials
            const canEdit = await this.companyService.checkPermission(userId, id, StartupRole.ADMIN);
            if (!canEdit) throw new ForbiddenError('Insufficient permissions');

            const report = await this.financialService.addFinancialReport(id, req.body);

            res.status(201).json({
                success: true,
                data: report,
            });
        } catch (error) {
            next(error);
        }
    };

    // MILESTONES

    getMilestones = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const milestones = await this.financialService.getMilestones(id);
            res.json({ success: true, data: milestones });
        } catch (error) {
            next(error);
        }
    };

    addMilestone = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            if (!userId) throw new ForbiddenError('Not authenticated');

            const canEdit = await this.companyService.checkPermission(userId, id, StartupRole.EDITOR);
            if (!canEdit) throw new ForbiddenError('Insufficient permissions');

            const milestone = await this.financialService.addMilestone(id, req.body);
            res.status(201).json({ success: true, data: milestone });
        } catch (error) {
            next(error);
        }
    };
}
