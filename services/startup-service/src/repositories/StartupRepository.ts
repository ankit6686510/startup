import { Repository, SelectQueryBuilder, FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Startup } from '../models/Startup';
import { Founder } from '../models/Founder';
import { StartupMetrics } from '../models/StartupMetrics';
import {
  GetStartupsRequest,
  PaginatedResponse,
  StartupSummary,
  Industry,
  StartupStatus,
  FundingRound,
} from '@startup-platform/types';

export class StartupRepository {
  private repository: Repository<Startup>;
  private founderRepository: Repository<Founder>;
  private metricsRepository: Repository<StartupMetrics>;

  constructor() {
    this.repository = AppDataSource.getRepository(Startup);
    this.founderRepository = AppDataSource.getRepository(Founder);
    this.metricsRepository = AppDataSource.getRepository(StartupMetrics);
  }

  async findById(id: string, relations: string[] = []): Promise<Startup | null> {
    return this.repository.findOne({
      where: { id },
      relations,
    });
  }

  async findBySlug(slug: string, relations: string[] = []): Promise<Startup | null> {
    return this.repository.findOne({
      where: { slug },
      relations,
    });
  }

  async findAll(params: GetStartupsRequest): Promise<PaginatedResponse<StartupSummary>> {
    const queryBuilder = this.repository.createQueryBuilder('startup');

    // Apply filters
    this.applyFilters(queryBuilder, params);

    // Apply search
    if (params.search) {
      queryBuilder.andWhere(
        '(LOWER(startup.name) LIKE LOWER(:search) OR LOWER(startup.description) LIKE LOWER(:search))',
        { search: `%${params.search}%` },
      );
    }

    // Apply sorting
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = (params.sortOrder || 'desc').toUpperCase() as 'ASC' | 'DESC';
    queryBuilder.orderBy(`startup.${sortBy}`, sortOrder);

    // Apply pagination
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    const offset = (page - 1) * limit;

    queryBuilder.skip(offset).take(limit);

    // Execute query
    const [startups, total] = await queryBuilder.getManyAndCount();

    // Transform to summary format
    const data: StartupSummary[] = startups.map((startup) => ({
      id: startup.id,
      name: startup.name,
      slug: startup.slug,
      logoUrl: startup.logoUrl,
      industry: startup.industry,
      location: startup.location,
      foundedYear: startup.foundedYear,
      totalFunding: startup.totalFunding,
      stage: startup.stage,
      status: startup.status,
      employeeCount: startup.employeeCount,
      tags: startup.tags,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async create(startup: Partial<Startup>, founders: Partial<Founder>[]): Promise<Startup> {
    return AppDataSource.transaction(async (manager) => {
      // Create startup
      const startupEntity = manager.create(Startup, startup);
      const savedStartup = await manager.save(startupEntity);

      // Create founders
      const founderEntities = founders.map((founder) =>
        manager.create(Founder, { ...founder, startupId: savedStartup.id }),
      );
      await manager.save(founderEntities);

      // Return startup with founders
      return manager.findOne(Startup, {
        where: { id: savedStartup.id },
        relations: ['founders'],
      }) as Promise<Startup>;
    });
  }

  async update(id: string, updates: Partial<Startup>): Promise<Startup | null> {
    await this.repository.update(id, updates);
    return this.findById(id, ['founders']);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async findByIndustry(industry: Industry, limit: number = 10): Promise<Startup[]> {
    return this.repository.find({
      where: { industry, status: StartupStatus.ACTIVE },
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findFeatured(limit: number = 5): Promise<Startup[]> {
    return this.repository.find({
      where: {
        verified: true,
        status: StartupStatus.ACTIVE,
      },
      take: limit,
      order: { totalFunding: 'DESC' },
    });
  }

  async getStartupStats(): Promise<{
    total: number;
    verified: number;
    byIndustry: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const [total, verified] = await Promise.all([
      this.repository.count(),
      this.repository.count({ where: { verified: true } }),
    ]);

    const byIndustryQuery = await this.repository
      .createQueryBuilder('startup')
      .select('startup.industry', 'industry')
      .addSelect('COUNT(*)', 'count')
      .groupBy('startup.industry')
      .getRawMany();

    const byStatusQuery = await this.repository
      .createQueryBuilder('startup')
      .select('startup.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('startup.status')
      .getRawMany();

    const byIndustry = byIndustryQuery.reduce(
      (acc, item) => {
        acc[item.industry] = parseInt(item.count);
        return acc;
      },
      {} as Record<string, number>,
    );

    const byStatus = byStatusQuery.reduce(
      (acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      },
      {} as Record<string, number>,
    );

    return { total, verified, byIndustry, byStatus };
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Startup>,
    params: GetStartupsRequest,
  ): void {
    if (params.industry?.length) {
      queryBuilder.andWhere('startup.industry IN (:...industries)', {
        industries: params.industry,
      });
    }

    if (params.status?.length) {
      queryBuilder.andWhere('startup.status IN (:...statuses)', { statuses: params.status });
    }

    if (params.location?.countries?.length) {
      queryBuilder.andWhere('startup.locationCountry IN (:...countries)', {
        countries: params.location.countries,
      });
    }

    if (params.foundedAfter) {
      queryBuilder.andWhere('startup.foundedYear >= :foundedAfter', {
        foundedAfter: params.foundedAfter.getFullYear(),
      });
    }

    if (params.foundedBefore) {
      queryBuilder.andWhere('startup.foundedYear <= :foundedBefore', {
        foundedBefore: params.foundedBefore.getFullYear(),
      });
    }

    if (params.minFunding) {
      queryBuilder.andWhere('startup.totalFunding >= :minFunding', {
        minFunding: params.minFunding,
      });
    }

    if (params.maxFunding) {
      queryBuilder.andWhere('startup.totalFunding <= :maxFunding', {
        maxFunding: params.maxFunding,
      });
    }

    if (params.verified !== undefined) {
      queryBuilder.andWhere('startup.verified = :verified', { verified: params.verified });
    }

    if (params.hasJobs) {
      queryBuilder.andWhere(
        'EXISTS (SELECT 1 FROM jobs j WHERE j.startup_id = startup.id AND j.is_active = true)',
      );
    }
  }
}
