import { Repository, SelectQueryBuilder } from 'typeorm';
import { AppDataSource } from '@/config/database';
import { FundingRound } from '@/models/FundingRound';
import { Investor } from '@/models/Investor';
import { Investment } from '@/models/Investment';
import { Valuation, ValuationType, ValuationMethod } from '@/models/Valuation';
import { MarketData, MarketDataType } from '@/models/MarketData';
import { logger } from '@/utils/logger';
import {
  FundingRound as FundingRoundType,
  InvestorType,
  Currency
} from '@startup-platform/types';

export interface FundingRoundFilters {
  startupIds?: string[];
  roundTypes?: FundingRoundType[];
  minAmount?: number;
  maxAmount?: number;
  currency?: Currency;
  dateFrom?: Date;
  dateTo?: Date;
  isConfirmed?: boolean;
  investorIds?: string[];
}

export interface InvestorFilters {
  types?: InvestorType[];
  industries?: string[];
  geographies?: string[];
  minInvestment?: number;
  maxInvestment?: number;
  isVerified?: boolean;
  isActivelyInvesting?: boolean;
  search?: string;
}

export interface FundingRoundCreateData {
  startupId: string;
  roundType: FundingRoundType;
  name?: string;
  description?: string;
  amount: number;
  currency?: Currency;
  preMoneyValuation?: number;
  postMoneyValuation?: number;
  sharesIssued?: number;
  pricePerShare?: number;
  announcedDate?: Date;
  closedDate?: Date;
  expectedCloseDate?: Date;
  isConfirmed?: boolean;
  leadInvestorId?: string;
  minimumInvestment?: number;
  maximumInvestment?: number;
  isConvertible?: boolean;
  isEquity?: boolean;
  isDebt?: boolean;
  isSafe?: boolean;
  isNote?: boolean;
  interestRate?: number;
  discountRate?: number;
  valuationCap?: number;
  securityTypes?: string[];
  investorRights?: string[];
  liquidationPreferences?: string[];
  antiDilutionProtection?: string;
  dragAlongRights?: boolean;
  tagAlongRights?: boolean;
  preemptiveRights?: boolean;
  useOfFunds?: any;
  competitors?: string[];
  marketSegments?: string[];
  totalAddressableMarket?: number;
  source?: string;
  sourceUrl?: string;
  sourceReferenceId?: string;
  pressUrls?: string[];
  documentUrls?: string[];
  metadata?: Record<string, any>;
}

export interface InvestorCreateData {
  name: string;
  description?: string;
  type: InvestorType;
  website?: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  locationCountry?: string;
  locationCountryCode?: string;
  locationCity?: string;
  locationState?: string;
  locationAddress?: string;
  investmentStages?: string[];
  industries?: string[];
  geographies?: string[];
  minInvestment?: number;
  maxInvestment?: number;
  typicalInvestment?: number;
  fundSize?: number;
  assetsUnderManagement?: number;
  foundedDate?: Date;
  keyPeople?: string[];
  notableInvestments?: string[];
  investmentPhilosophy?: string;
  valueAddServices?: string;
  socialLinks?: any;
  contactPreferences?: any;
  fundName?: string;
  fundNumber?: string;
  fundVintage?: number;
  fundCloseDate?: Date;
  investmentPeriodEnd?: Date;
  generalPartnersCount?: number;
  limitedPartnersCount?: number;
  investmentCriteria?: any;
  dataSource?: string;
  sourceReferenceId?: string;
  metadata?: Record<string, any>;
}

export interface InvestmentCreateData {
  fundingRoundId: string;
  investorId: string;
  amount?: number;
  currency?: Currency;
  sharesAcquired?: number;
  ownershipPercentage?: number;
  pricePerShare?: number;
  investmentDate?: Date;
  isLeadInvestor?: boolean;
  isFollowOn?: boolean;
  isProRata?: boolean;
  isInsider?: boolean;
  isNewInvestor?: boolean;
  securityType?: string;
  isConvertible?: boolean;
  conversionTerms?: string;
  liquidationPreference?: number;
  dividendRate?: number;
  antiDilutionProtection?: string;
  boardSeats?: number;
  observerRights?: boolean;
  votingRights?: boolean;
  consentRights?: boolean;
  informationRights?: boolean;
  preemptiveRights?: boolean;
  dragAlongRights?: boolean;
  tagAlongRights?: boolean;
  preMoneyValuation?: number;
  postMoneyValuation?: number;
  valuationMultiple?: number;
  committedAmount?: number;
  dueDiligenceCompleted?: boolean;
  legalDocsSigned?: boolean;
  fundsTransferred?: boolean;
  documentUrls?: string[];
  legalDocuments?: string[];
  updatesFrequency?: string;
  milestones?: any;
  dataSource?: string;
  sourceReferenceId?: string;
  metadata?: Record<string, any>;
}

export class FundingService {
  private fundingRoundRepository: Repository<FundingRound>;
  private investorRepository: Repository<Investor>;
  private investmentRepository: Repository<Investment>;
  private valuationRepository: Repository<Valuation>;
  private marketDataRepository: Repository<MarketData>;

  constructor() {
    this.fundingRoundRepository = AppDataSource.getRepository(FundingRound);
    this.investorRepository = AppDataSource.getRepository(Investor);
    this.investmentRepository = AppDataSource.getRepository(Investment);
    this.valuationRepository = AppDataSource.getRepository(Valuation);
    this.marketDataRepository = AppDataSource.getRepository(MarketData);
  }

  // Funding Round methods
  async createFundingRound(data: FundingRoundCreateData): Promise<FundingRound> {
    const fundingRound = this.fundingRoundRepository.create(data);
    const savedRound = await this.fundingRoundRepository.save(fundingRound);

    logger.info(`Funding round created: ${savedRound.id} for startup ${savedRound.startupId}`);
    return savedRound;
  }

  async updateFundingRound(id: string, data: Partial<FundingRoundCreateData>): Promise<FundingRound> {
    const fundingRound = await this.fundingRoundRepository.findOne({ where: { id } });

    if (!fundingRound) {
      throw new Error('Funding round not found');
    }

    Object.assign(fundingRound, data);
    const updatedRound = await this.fundingRoundRepository.save(fundingRound);

    logger.info(`Funding round updated: ${updatedRound.id}`);
    return updatedRound;
  }

  async getFundingRoundById(id: string): Promise<FundingRound | null> {
    return await this.fundingRoundRepository.findOne({
      where: { id },
      relations: ['investments', 'investments.investor', 'valuations']
    });
  }

  async getFundingRounds(
    filters: FundingRoundFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ rounds: FundingRound[], total: number }> {
    const queryBuilder = this.createFundingRoundQueryBuilder(filters);

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Default sorting by announced date (newest first)
    queryBuilder.orderBy('round.announcedDate', 'DESC')
      .addOrderBy('round.createdAt', 'DESC');

    const [rounds, total] = await queryBuilder.getManyAndCount();
    return { rounds, total };
  }

  async getFundingRoundsByStartup(startupId: string): Promise<FundingRound[]> {
    return await this.fundingRoundRepository.find({
      where: { startupId },
      relations: ['investments', 'investments.investor'],
      order: { announcedDate: 'DESC' }
    });
  }

  async getRecentFundingRounds(limit: number = 10): Promise<FundingRound[]> {
    return await this.fundingRoundRepository.find({
      where: { isConfirmed: true },
      order: { announcedDate: 'DESC' },
      take: limit,
      relations: ['investments', 'investments.investor']
    });
  }

  // Investor methods
  async createInvestor(data: InvestorCreateData): Promise<Investor> {
    // Generate slug from name
    const baseSlug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique
    while (await this.investorRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const investor = this.investorRepository.create({
      ...data,
      slug
    });

    const savedInvestor = await this.investorRepository.save(investor);
    logger.info(`Investor created: ${savedInvestor.id} - ${savedInvestor.name}`);

    return savedInvestor;
  }

  async updateInvestor(id: string, data: Partial<InvestorCreateData>): Promise<Investor> {
    const investor = await this.investorRepository.findOne({ where: { id } });

    if (!investor) {
      throw new Error('Investor not found');
    }

    Object.assign(investor, data);
    const updatedInvestor = await this.investorRepository.save(investor);

    logger.info(`Investor updated: ${updatedInvestor.id}`);
    return updatedInvestor;
  }

  async getInvestorById(id: string): Promise<Investor | null> {
    return await this.investorRepository.findOne({
      where: { id },
      relations: ['investments', 'investments.fundingRound']
    });
  }

  async getInvestorBySlug(slug: string): Promise<Investor | null> {
    return await this.investorRepository.findOne({
      where: { slug },
      relations: ['investments', 'investments.fundingRound']
    });
  }

  async getInvestors(
    filters: InvestorFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ investors: Investor[], total: number }> {
    const queryBuilder = this.createInvestorQueryBuilder(filters);

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Default sorting by credibility score and verification status
    queryBuilder.orderBy('investor.isVerified', 'DESC')
      .addOrderBy('investor.credibilityScore', 'DESC')
      .addOrderBy('investor.totalInvestmentsCount', 'DESC');

    const [investors, total] = await queryBuilder.getManyAndCount();
    return { investors, total };
  }

  async searchInvestors(query: string, filters: InvestorFilters, page: number = 1, limit: number = 20): Promise<{ investors: Investor[], total: number }> {
    const searchFilters = { ...filters, search: query };
    return await this.getInvestors(searchFilters, page, limit);
  }

  // Investment methods
  async createInvestment(data: InvestmentCreateData): Promise<Investment> {
    const investment = this.investmentRepository.create(data);
    const savedInvestment = await this.investmentRepository.save(investment);

    // Update funding round investor count
    const fundingRound = await this.fundingRoundRepository.findOne({
      where: { id: data.fundingRoundId }
    });

    if (fundingRound) {
      fundingRound.addInvestorCount();
      if (data.isLeadInvestor && data.investorId) {
        fundingRound.setLeadInvestor(data.investorId);
      }
      await this.fundingRoundRepository.save(fundingRound);
    }

    logger.info(`Investment created: ${savedInvestment.id}`);
    return savedInvestment;
  }

  async getInvestmentsByFundingRound(fundingRoundId: string): Promise<Investment[]> {
    return await this.investmentRepository.find({
      where: { fundingRoundId },
      relations: ['investor'],
      order: { investmentDate: 'DESC' }
    });
  }

  async getInvestmentsByInvestor(investorId: string): Promise<Investment[]> {
    return await this.investmentRepository.find({
      where: { investorId },
      relations: ['fundingRound'],
      order: { investmentDate: 'DESC' }
    });
  }

  // Valuation methods
  async createValuation(data: Partial<Valuation>): Promise<Valuation> {
    const valuation = this.valuationRepository.create(data);
    const savedValuation = await this.valuationRepository.save(valuation) as Valuation;

    logger.info(`Valuation created: ${savedValuation.id} for startup ${savedValuation.startupId}`);
    return savedValuation;
  }

  async getValuationsByStartup(startupId: string): Promise<Valuation[]> {
    return await this.valuationRepository.find({
      where: { startupId },
      order: { valuationDate: 'DESC' }
    });
  }

  async getLatestValuation(startupId: string, type?: ValuationType): Promise<Valuation | null> {
    const where: any = { startupId };
    if (type) {
      where.valuationType = type;
    }

    return await this.valuationRepository.findOne({
      where,
      order: { valuationDate: 'DESC' }
    });
  }

  // Market Data methods
  async createMarketData(data: Partial<MarketData>): Promise<MarketData> {
    const marketData = this.marketDataRepository.create(data);
    const savedData = await this.marketDataRepository.save(marketData) as MarketData;

    logger.info(`Market data created: ${savedData.id} - ${savedData.dataType}`);
    return savedData;
  }

  async getMarketData(
    dataType: MarketDataType,
    industry?: string,
    geography?: string,
    stage?: string,
    limit: number = 10
  ): Promise<MarketData[]> {
    const where: any = { dataType };
    if (industry) where.industry = industry;
    if (geography) where.geography = geography;
    if (stage) where.stage = stage;

    return await this.marketDataRepository.find({
      where,
      order: { date: 'DESC' },
      take: limit
    });
  }

  async getLatestMarketData(dataType: MarketDataType): Promise<MarketData | null> {
    return await this.marketDataRepository.findOne({
      where: { dataType },
      order: { date: 'DESC' }
    });
  }

  // Analytics and insights
  async getFundingStats(startupId?: string): Promise<any> {
    const queryBuilder = this.fundingRoundRepository.createQueryBuilder('round');

    if (startupId) {
      queryBuilder.where('round.startupId = :startupId', { startupId });
    }

    const [
      totalRounds,
      totalAmount,
      averageAmount,
      confirmedRounds
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder
        .select('SUM(round.amount)', 'total')
        .getRawOne()
        .then(result => parseInt(result.total) || 0),
      queryBuilder
        .select('AVG(round.amount)', 'average')
        .getRawOne()
        .then(result => parseInt(result.average) || 0),
      queryBuilder.clone().andWhere('round.isConfirmed = :confirmed', { confirmed: true }).getCount()
    ]);

    return {
      totalRounds,
      totalAmount,
      averageAmount,
      confirmedRounds,
      confirmationRate: totalRounds > 0 ? (confirmedRounds / totalRounds) * 100 : 0
    };
  }

  async getInvestorStats(investorId?: string): Promise<any> {
    const queryBuilder = this.investmentRepository.createQueryBuilder('investment');

    if (investorId) {
      queryBuilder.where('investment.investorId = :investorId', { investorId });
    }

    const [
      totalInvestments,
      totalAmount,
      averageAmount,
      activeInvestments
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder
        .select('SUM(investment.amount)', 'total')
        .getRawOne()
        .then(result => parseInt(result.total) || 0),
      queryBuilder
        .select('AVG(investment.amount)', 'average')
        .getRawOne()
        .then(result => parseInt(result.average) || 0),
      queryBuilder.clone().andWhere('investment.isActive = :active', { active: true }).getCount()
    ]);

    return {
      totalInvestments,
      totalAmount,
      averageAmount,
      activeInvestments,
      activeRate: totalInvestments > 0 ? (activeInvestments / totalInvestments) * 100 : 0
    };
  }

  async getFundingTrends(
    period: 'monthly' | 'quarterly' | 'yearly' = 'quarterly',
    industry?: string,
    geography?: string
  ): Promise<any[]> {
    const marketData = await this.getMarketData(
      MarketDataType.FUNDING_TRENDS,
      industry,
      geography,
      undefined,
      12
    );

    return marketData.map(data => ({
      period: data.date,
      totalFunding: data.totalFundingAmount,
      numberOfDeals: data.numberOfDeals,
      averageDealSize: data.averageDealSize,
      growth: data.quarterOverQuarterGrowth || data.yearOverYearGrowth,
      trendDirection: data.trendDirection
    }));
  }

  async getValuationBenchmarks(
    industry: string,
    stage?: string
  ): Promise<{
    averageValuation: number;
    medianValuation: number;
    revenueMultiple: number;
    sampleSize: number;
  }> {
    const marketData = await this.getLatestMarketData(MarketDataType.VALUATION_MULTIPLES);

    if (!marketData || marketData.industry !== industry) {
      return {
        averageValuation: 0,
        medianValuation: 0,
        revenueMultiple: 0,
        sampleSize: 0
      };
    }

    return {
      averageValuation: marketData.averagePreMoneyValuation || 0,
      medianValuation: marketData.medianPreMoneyValuation || 0,
      revenueMultiple: marketData.averageRevenueMultiple || 0,
      sampleSize: marketData.sampleSize || 0
    };
  }

  // Helper methods
  private createFundingRoundQueryBuilder(filters: FundingRoundFilters): SelectQueryBuilder<FundingRound> {
    const queryBuilder = this.fundingRoundRepository
      .createQueryBuilder('round')
      .leftJoinAndSelect('round.investments', 'investments')
      .leftJoinAndSelect('investments.investor', 'investor');

    if (filters.startupIds && filters.startupIds.length > 0) {
      queryBuilder.andWhere('round.startupId IN (:...startupIds)', { startupIds: filters.startupIds });
    }

    if (filters.roundTypes && filters.roundTypes.length > 0) {
      queryBuilder.andWhere('round.roundType IN (:...roundTypes)', { roundTypes: filters.roundTypes });
    }

    if (filters.minAmount) {
      queryBuilder.andWhere('round.amount >= :minAmount', { minAmount: filters.minAmount });
    }

    if (filters.maxAmount) {
      queryBuilder.andWhere('round.amount <= :maxAmount', { maxAmount: filters.maxAmount });
    }

    if (filters.currency) {
      queryBuilder.andWhere('round.currency = :currency', { currency: filters.currency });
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere('round.announcedDate >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere('round.announcedDate <= :dateTo', { dateTo: filters.dateTo });
    }

    if (filters.isConfirmed !== undefined) {
      queryBuilder.andWhere('round.isConfirmed = :isConfirmed', { isConfirmed: filters.isConfirmed });
    }

    if (filters.investorIds && filters.investorIds.length > 0) {
      queryBuilder.andWhere('investor.id IN (:...investorIds)', { investorIds: filters.investorIds });
    }

    return queryBuilder;
  }

  private createInvestorQueryBuilder(filters: InvestorFilters): SelectQueryBuilder<Investor> {
    const queryBuilder = this.investorRepository.createQueryBuilder('investor');

    if (filters.search) {
      queryBuilder.andWhere(
        '(investor.name ILIKE :search OR investor.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.types && filters.types.length > 0) {
      queryBuilder.andWhere('investor.type IN (:...types)', { types: filters.types });
    }

    if (filters.industries && filters.industries.length > 0) {
      queryBuilder.andWhere('investor.industries && :industries', { industries: filters.industries });
    }

    if (filters.geographies && filters.geographies.length > 0) {
      queryBuilder.andWhere('investor.geographies && :geographies', { geographies: filters.geographies });
    }

    if (filters.minInvestment) {
      queryBuilder.andWhere('investor.maxInvestment >= :minInvestment', { minInvestment: filters.minInvestment });
    }

    if (filters.maxInvestment) {
      queryBuilder.andWhere('investor.minInvestment <= :maxInvestment', { maxInvestment: filters.maxInvestment });
    }

    if (filters.isVerified !== undefined) {
      queryBuilder.andWhere('investor.isVerified = :isVerified', { isVerified: filters.isVerified });
    }

    if (filters.isActivelyInvesting !== undefined) {
      queryBuilder.andWhere('investor.isActivelyInvesting = :isActivelyInvesting', { isActivelyInvesting: filters.isActivelyInvesting });
    }

    return queryBuilder;
  }

  async deleteFundingRound(id: string): Promise<void> {
    const result = await this.fundingRoundRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Funding round not found');
    }
    logger.info(`Funding round deleted: ${id}`);
  }

  async deleteInvestor(id: string): Promise<void> {
    const result = await this.investorRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Investor not found');
    }
    logger.info(`Investor deleted: ${id}`);
  }
}