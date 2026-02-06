import { AppDataSource } from '../config/database';
import { StartupMember, StartupRole } from '../models/StartupMember';
import { Startup } from '../models/Startup';
import { logger } from '../utils/logger';

export class CompanyService {
    private memberRepository = AppDataSource.getRepository(StartupMember);
    private startupRepository = AppDataSource.getRepository(Startup);


    async addMember(startupId: string, userId: string, role: StartupRole, invitedBy: string): Promise<StartupMember> {
        // Check if member already exists
        const existing = await this.memberRepository.findOne({
            where: { startupId, userId },
        });

        if (existing) {
            if (!existing.isActive) {
                existing.isActive = true;
                existing.role = role;
                return this.memberRepository.save(existing);
            }
            throw new Error('User is already a member of this startup');
        }

        const member = this.memberRepository.create({
            startupId,
            userId,
            role,
            invitedBy,
            isActive: true,
        });

        try {
            const savedMember = await this.memberRepository.save(member);
            logger.info(`Added member ${userId} to startup ${startupId} with role ${role}`);
            return savedMember;
        } catch (error: any) {
            logger.error(`Failed to add member: ${error.message}`);
            throw error;
        }

    }

    async removeMember(startupId: string, userId: string): Promise<void> {
        const member = await this.memberRepository.findOne({
            where: { startupId, userId },
        });

        if (!member) {
            throw new Error('Member not found');
        }

        // Don't fully delete, just deactivate or hard delete depends on policy.
        // For now, let's hard delete to keep it simple, or Soft Delete if Entity supports it.
        // Given the previous plan, let's hard delete.
        await this.memberRepository.remove(member);
        logger.info(`Removed member ${userId} from startup ${startupId}`);
    }


    async updateMemberRole(startupId: string, userId: string, newRole: StartupRole): Promise<StartupMember> {
        const member = await this.memberRepository.findOne({
            where: { startupId, userId },
        });

        if (!member) {
            throw new Error('Member not found');
        }

        member.role = newRole;
        return this.memberRepository.save(member);
    }

    async getMembers(startupId: string): Promise<StartupMember[]> {
        return this.memberRepository.find({
            where: { startupId },
            order: { createdAt: 'DESC' },
        });
    }

    async checkPermission(userId: string, startupId: string, requiredRole: StartupRole): Promise<boolean> {
        const member = await this.memberRepository.findOne({
            where: { startupId, userId, isActive: true },
        });

        if (!member) return false;

        // Role hierarchy
        const hierarchy = {
            [StartupRole.OWNER]: 4,
            [StartupRole.ADMIN]: 3,
            [StartupRole.RECRUITER]: 2,
            [StartupRole.EDITOR]: 2,
            [StartupRole.VIEWER]: 1,
        };

        const memberLevel = hierarchy[member.role];
        const requiredLevel = hierarchy[requiredRole];

        return memberLevel >= requiredLevel;
    }
}
