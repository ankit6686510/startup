import { AppDataSource } from '../config/database';
import { StartupFinancials, AccessLevel } from '../models/StartupFinancials';
import { StartupMilestone } from '../models/StartupMilestone';
import { logger } from '../utils/logger';

export class FinancialService {
    private financialRepository = AppDataSource.getRepository(StartupFinancials);
    private milestoneRepository = AppDataSource.getRepository(StartupMilestone);


    // --- Financials ---

    async addFinancialReport(startupId: string, data: Partial<StartupFinancials>): Promise<StartupFinancials> {
        const report = this.financialRepository.create({
            startupId,
            ...data,
        });
        return this.financialRepository.save(report);
    }

    async getFinancials(startupId: string, accessLevel: AccessLevel): Promise<StartupFinancials[]> {
        const query = this.financialRepository.createQueryBuilder('financial')
            .where('financial.startupId = :startupId', { startupId })
            .orderBy('financial.periodEnd', 'DESC');

        if (accessLevel !== AccessLevel.PRIVATE) {
            // If public, only show public
            if (accessLevel === AccessLevel.PUBLIC) {
                query.andWhere('financial.accessLevel = :level', { level: AccessLevel.PUBLIC });
            }
            // If investor, show public + investor
            if (accessLevel === AccessLevel.VERIFIED_INVESTOR) {
                query.andWhere('financial.accessLevel IN (:...levels)', { levels: [AccessLevel.PUBLIC, AccessLevel.VERIFIED_INVESTOR] });
            }
        }

        return query.getMany();
    }

    // --- Milestones ---

    async addMilestone(startupId: string, data: Partial<StartupMilestone>): Promise<StartupMilestone> {
        const milestone = this.milestoneRepository.create({
            startupId,
            ...data,
        });
        return this.milestoneRepository.save(milestone);
    }

    async getMilestones(startupId: string): Promise<StartupMilestone[]> {
        return this.milestoneRepository.find({
            where: { startupId, isVisible: true },
            order: { date: 'DESC' }
        });
    }
}
