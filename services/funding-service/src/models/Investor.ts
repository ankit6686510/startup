import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { InvestorType } from '@startup-platform/types';
import { Investment } from './Investment';

@Entity('investors')
export class Investor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  @Index()
  name: string;

  @Column({ length: 300 })
  @Index({ unique: true })
  slug: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: InvestorType,
  })
  @Index()
  type: InvestorType;

  // Contact information
  @Column({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl?: string;

  // Location
  @Column({ name: 'location_country', nullable: true })
  @Index()
  locationCountry?: string;

  @Column({ name: 'location_country_code', length: 2, nullable: true })
  locationCountryCode?: string;

  @Column({ name: 'location_city', nullable: true })
  locationCity?: string;

  @Column({ name: 'location_state', nullable: true })
  locationState?: string;

  @Column({ name: 'location_address', nullable: true })
  locationAddress?: string;

  // Investment criteria and focus
  @Column('text', { array: true, default: '{}' })
  investmentStages: string[]; // Seed, Series A, etc.

  @Column('text', { array: true, default: '{}' })
  industries: string[]; // Tech, Healthcare, etc.

  @Column('text', { array: true, default: '{}' })
  geographies: string[]; // US, Europe, Asia, etc.

  @Column({ name: 'min_investment', type: 'bigint', nullable: true })
  minInvestment?: number;

  @Column({ name: 'max_investment', type: 'bigint', nullable: true })
  maxInvestment?: number;

  @Column({ name: 'typical_investment', type: 'bigint', nullable: true })
  typicalInvestment?: number;

  @Column({ name: 'fund_size', type: 'bigint', nullable: true })
  fundSize?: number;

  @Column({ name: 'assets_under_management', type: 'bigint', nullable: true })
  assetsUnderManagement?: number;

  // Portfolio and performance
  @Column({ name: 'portfolio_companies_count', default: 0 })
  portfolioCompaniesCount: number;

  @Column({ name: 'active_investments_count', default: 0 })
  activeInvestmentsCount: number;

  @Column({ name: 'total_investments_count', default: 0 })
  totalInvestmentsCount: number;

  @Column({ name: 'successful_exits_count', default: 0 })
  successfulExitsCount: number;

  @Column({ name: 'avg_investment_amount', type: 'bigint', nullable: true })
  avgInvestmentAmount?: number;

  @Column({ name: 'first_investment_date', nullable: true })
  firstInvestmentDate?: Date;

  @Column({ name: 'last_investment_date', nullable: true })
  lastInvestmentDate?: Date;

  // Investor profile
  @Column({ name: 'founded_date', nullable: true })
  foundedDate?: Date;

  @Column('text', { array: true, default: '{}' })
  keyPeople: string[]; // Names of key partners/principals

  @Column('text', { array: true, default: '{}' })
  notableInvestments: string[]; // Company names of notable investments

  @Column({ name: 'investment_philosophy', nullable: true })
  investmentPhilosophy?: string;

  @Column({ name: 'value_add_services', nullable: true })
  valueAddServices?: string;

  // Verification and credibility
  @Column({ name: 'is_verified', default: false })
  @Index()
  isVerified: boolean;

  @Column({ name: 'verified_by', nullable: true })
  verifiedBy?: string;

  @Column({ name: 'verified_at', nullable: true })
  verifiedAt?: Date;

  @Column({ name: 'credibility_score', type: 'decimal', precision: 3, scale: 2, default: 0 })
  credibilityScore: number; // 0-100 score

  @Column({ name: 'response_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  responseRate?: number; // Percentage of pitches they respond to

  @Column({ name: 'avg_response_time_days', nullable: true })
  avgResponseTimeDays?: number;

  // Social links and presence
  @Column('jsonb', { name: 'social_links', default: '{}' })
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    crunchbase?: string;
    angelList?: string;
    pitchbook?: string;
    personalWebsite?: string;
  };

  // Contact preferences
  @Column('jsonb', { name: 'contact_preferences', default: '{}' })
  contactPreferences: {
    acceptsColdOutreach?: boolean;
    preferredContactMethod?: 'email' | 'linkedin' | 'warm_intro';
    introductionRequired?: boolean;
    responseTimeExpectation?: string;
    investmentDecisionTimeframe?: string;
  };

  // Fund information (for VCs)
  @Column({ name: 'fund_name', nullable: true })
  fundName?: string;

  @Column({ name: 'fund_number', nullable: true })
  fundNumber?: string;

  @Column({ name: 'fund_vintage', nullable: true })
  fundVintage?: number; // Year the fund was raised

  @Column({ name: 'fund_close_date', nullable: true })
  fundCloseDate?: Date;

  @Column({ name: 'investment_period_end', nullable: true })
  investmentPeriodEnd?: Date;

  @Column({ name: 'general_partners_count', nullable: true })
  generalPartnersCount?: number;

  @Column({ name: 'limited_partners_count', nullable: true })
  limitedPartnersCount?: number;

  // Investment thesis and criteria
  @Column('jsonb', { name: 'investment_criteria', default: '{}' })
  investmentCriteria: {
    businessModels?: string[];
    revenueRange?: { min?: number; max?: number };
    teamSize?: { min?: number; max?: number };
    technologyStack?: string[];
    marketSize?: { min?: number };
    competitiveAdvantage?: string[];
    growthMetrics?: string[];
  };

  // Activity and engagement
  @Column({ name: 'last_activity_date', nullable: true })
  lastActivityDate?: Date;

  @Column({ name: 'is_actively_investing', default: true })
  isActivelyInvesting: boolean;

  @Column({ name: 'pitch_deck_views_count', default: 0 })
  pitchDeckViewsCount: number;

  @Column({ name: 'startup_meetings_count', default: 0 })
  startupMeetingsCount: number;

  // Source tracking
  @Column({ name: 'data_source', default: 'manual' })
  dataSource: string;

  @Column({ name: 'source_reference_id', nullable: true })
  sourceReferenceId?: string;

  @Column({ name: 'last_sync_date', nullable: true })
  lastSyncDate?: Date;

  // Additional metadata
  @Column('jsonb', { name: 'metadata', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Investment, (investment) => investment.investor)
  investments: Investment[];

  // Virtual getters
  get location(): string {
    const parts = [];
    if (this.locationCity) parts.push(this.locationCity);
    if (this.locationState) parts.push(this.locationState);
    if (this.locationCountry) parts.push(this.locationCountry);
    return parts.join(', ') || 'Location not specified';
  }

  get investmentRange(): string {
    if (!this.minInvestment && !this.maxInvestment) {
      return 'Not specified';
    }

    const formatAmount = (amount: number) => {
      if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`;
      }
      if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(0)}K`;
      }
      return `$${amount}`;
    };

    if (this.minInvestment && this.maxInvestment) {
      return `${formatAmount(this.minInvestment)} - ${formatAmount(this.maxInvestment)}`;
    } else if (this.minInvestment) {
      return `From ${formatAmount(this.minInvestment)}`;
    } else if (this.maxInvestment) {
      return `Up to ${formatAmount(this.maxInvestment)}`;
    }

    return 'Not specified';
  }

  get investmentExperience(): string {
    if (this.totalInvestmentsCount === 0) return 'New investor';
    if (this.totalInvestmentsCount < 5) return 'Early stage investor';
    if (this.totalInvestmentsCount < 20) return 'Experienced investor';
    return 'Veteran investor';
  }

  get successRate(): number {
    if (this.totalInvestmentsCount === 0) return 0;
    return (this.successfulExitsCount / this.totalInvestmentsCount) * 100;
  }

  get isAngel(): boolean {
    return this.type === InvestorType.ANGEL;
  }

  get isVC(): boolean {
    return this.type === InvestorType.VC;
  }

  get isCorporate(): boolean {
    return this.type === InvestorType.CORPORATE;
  }

  // Methods
  updatePortfolioStats(investments: Investment[]): void {
    this.portfolioCompaniesCount = investments.length;
    this.activeInvestmentsCount = investments.filter((inv) => inv.isActive).length;
    this.totalInvestmentsCount = investments.length;

    if (investments.length > 0) {
      const totalAmount = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      this.avgInvestmentAmount = Math.round(totalAmount / investments.length);

      const dates = investments
        .map((inv) => inv.investmentDate)
        .filter((date) => date)
        .sort((a, b) => a!.getTime() - b!.getTime());

      if (dates.length > 0) {
        this.firstInvestmentDate = dates[0];
        this.lastInvestmentDate = dates[dates.length - 1];
        this.lastActivityDate = this.lastInvestmentDate;
      }
    }
  }

  updateCredibilityScore(): void {
    let score = 0;

    // Base score for verification
    if (this.isVerified) score += 30;

    // Portfolio activity score
    if (this.totalInvestmentsCount > 0) {
      score += Math.min(this.totalInvestmentsCount * 2, 30);
    }

    // Success rate score
    if (this.successfulExitsCount > 0) {
      score += Math.min(this.successRate * 0.3, 20);
    }

    // Responsiveness score
    if (this.responseRate && this.responseRate > 0) {
      score += Math.min(this.responseRate * 0.1, 10);
    }

    // Recent activity score
    if (this.lastActivityDate) {
      const daysSinceActivity =
        (Date.now() - this.lastActivityDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceActivity < 30) score += 10;
      else if (daysSinceActivity < 90) score += 5;
    }

    this.credibilityScore = Math.min(score, 100);
  }

  addInvestmentStage(stage: string): void {
    if (!this.investmentStages.includes(stage)) {
      this.investmentStages.push(stage);
    }
  }

  addIndustry(industry: string): void {
    if (!this.industries.includes(industry)) {
      this.industries.push(industry);
    }
  }

  addGeography(geography: string): void {
    if (!this.geographies.includes(geography)) {
      this.geographies.push(geography);
    }
  }

  setVerificationStatus(isVerified: boolean, verifiedBy?: string): void {
    this.isVerified = isVerified;
    if (isVerified) {
      this.verifiedBy = verifiedBy;
      this.verifiedAt = new Date();
    }
    this.updateCredibilityScore();
  }

  recordActivity(): void {
    this.lastActivityDate = new Date();
  }

  recordPitchDeckView(): void {
    this.pitchDeckViewsCount += 1;
    this.recordActivity();
  }

  recordStartupMeeting(): void {
    this.startupMeetingsCount += 1;
    this.recordActivity();
  }

  matchesInvestmentCriteria(startupData: any): boolean {
    // Industry match
    if (this.industries.length > 0) {
      const hasIndustryMatch = this.industries.some((industry) =>
        startupData.industry?.toLowerCase().includes(industry.toLowerCase()),
      );
      if (!hasIndustryMatch) return false;
    }

    // Stage match
    if (this.investmentStages.length > 0) {
      const hasStageMatch = this.investmentStages.some((stage) =>
        startupData.stage?.toLowerCase().includes(stage.toLowerCase()),
      );
      if (!hasStageMatch) return false;
    }

    // Geography match
    if (this.geographies.length > 0) {
      const hasGeoMatch = this.geographies.some((geo) =>
        startupData.location?.toLowerCase().includes(geo.toLowerCase()),
      );
      if (!hasGeoMatch) return false;
    }

    // Investment amount range
    if (startupData.fundingAmount) {
      if (this.minInvestment && startupData.fundingAmount < this.minInvestment) {
        return false;
      }
      if (this.maxInvestment && startupData.fundingAmount > this.maxInvestment) {
        return false;
      }
    }

    return true;
  }

  canInvest(amount: number): boolean {
    if (!this.isActivelyInvesting) return false;
    if (this.minInvestment && amount < this.minInvestment) return false;
    if (this.maxInvestment && amount > this.maxInvestment) return false;
    return true;
  }

  getInvestmentCapacity(): number {
    if (!this.fundSize || !this.totalInvestmentsCount) return 0;

    const estimatedDeployed = this.avgInvestmentAmount
      ? this.avgInvestmentAmount * this.totalInvestmentsCount
      : 0;

    return Math.max(0, this.fundSize - estimatedDeployed);
  }

  toPublicProfile() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      type: this.type,
      website: this.website,
      logoUrl: this.logoUrl,
      location: this.location,
      investmentStages: this.investmentStages,
      industries: this.industries,
      geographies: this.geographies,
      investmentRange: this.investmentRange,
      portfolioCompaniesCount: this.portfolioCompaniesCount,
      totalInvestmentsCount: this.totalInvestmentsCount,
      successfulExitsCount: this.successfulExitsCount,
      investmentExperience: this.investmentExperience,
      successRate: this.successRate,
      credibilityScore: this.credibilityScore,
      isVerified: this.isVerified,
      isActivelyInvesting: this.isActivelyInvesting,
      socialLinks: this.socialLinks,
      contactPreferences: this.contactPreferences,
    };
  }
}
