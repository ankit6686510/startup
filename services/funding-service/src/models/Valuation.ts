import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { Currency } from '@startup-platform/types';
import { FundingRound } from './FundingRound';

export enum ValuationType {
  PRE_MONEY = 'pre_money',
  POST_MONEY = 'post_money',
  MARKET = 'market',
  FAIR_VALUE = 'fair_value',
  LIQUIDATION = 'liquidation',
  BOOK_VALUE = 'book_value'
}

export enum ValuationMethod {
  DISCOUNTED_CASH_FLOW = 'dcf',
  COMPARABLE_COMPANIES = 'comps',
  PRECEDENT_TRANSACTIONS = 'precedent',
  RISK_ADJUSTED_NPV = 'risk_adjusted_npv',
  VENTURE_CAPITAL = 'venture_capital',
  ASSET_BASED = 'asset_based',
  REVENUE_MULTIPLE = 'revenue_multiple',
  USER_MULTIPLE = 'user_multiple',
  BERKUS_METHOD = 'berkus',
  SCORECARD_METHOD = 'scorecard',
  FIRST_CHICAGO = 'first_chicago'
}

@Entity('valuations')
export class Valuation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'startup_id' })
  @Index()
  startupId: string;

  @Column({ name: 'funding_round_id', nullable: true })
  fundingRoundId?: string;

  @Column({
    type: 'enum',
    enum: ValuationType
  })
  @Index()
  valuationType: ValuationType;

  @Column({
    type: 'enum',
    enum: ValuationMethod
  })
  @Index()
  valuationMethod: ValuationMethod;

  // Valuation amount
  @Column({ type: 'bigint' })
  @Index()
  amount: number; // Valuation in smallest currency unit

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.USD
  })
  currency: Currency;

  @Column({ name: 'amount_usd', type: 'bigint', nullable: true })
  amountUsd?: number; // Converted to USD for comparison

  @Column({ name: 'valuation_date' })
  @Index()
  valuationDate: Date;

  // Valuation context
  @Column({ name: 'shares_outstanding', type: 'bigint', nullable: true })
  sharesOutstanding?: number;

  @Column({ name: 'price_per_share', type: 'decimal', precision: 15, scale: 6, nullable: true })
  pricePerShare?: number;

  @Column({ name: 'enterprise_value', type: 'bigint', nullable: true })
  enterpriseValue?: number;

  @Column({ name: 'equity_value', type: 'bigint', nullable: true })
  equityValue?: number;

  // Financial metrics at time of valuation
  @Column({ name: 'annual_revenue', type: 'bigint', nullable: true })
  annualRevenue?: number;

  @Column({ name: 'monthly_recurring_revenue', type: 'bigint', nullable: true })
  monthlyRecurringRevenue?: number;

  @Column({ name: 'gross_margin', type: 'decimal', precision: 5, scale: 2, nullable: true })
  grossMargin?: number;

  @Column({ name: 'ebitda', type: 'bigint', nullable: true })
  ebitda?: number;

  @Column({ name: 'net_income', type: 'bigint', nullable: true })
  netIncome?: number;

  @Column({ name: 'cash_balance', type: 'bigint', nullable: true })
  cashBalance?: number;

  @Column({ name: 'total_debt', type: 'bigint', nullable: true })
  totalDebt?: number;

  @Column({ name: 'burn_rate', type: 'bigint', nullable: true })
  burnRate?: number;

  @Column({ name: 'runway_months', nullable: true })
  runwayMonths?: number;

  // Business metrics
  @Column({ name: 'active_users', type: 'bigint', nullable: true })
  activeUsers?: number;

  @Column({ name: 'total_users', type: 'bigint', nullable: true })
  totalUsers?: number;

  @Column({ name: 'customer_acquisition_cost', type: 'bigint', nullable: true })
  customerAcquisitionCost?: number;

  @Column({ name: 'lifetime_value', type: 'bigint', nullable: true })
  lifetimeValue?: number;

  @Column({ name: 'churn_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  churnRate?: number;

  @Column({ name: 'growth_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  growthRate?: number;

  // Valuation multiples
  @Column({ name: 'revenue_multiple', type: 'decimal', precision: 8, scale: 2, nullable: true })
  revenueMultiple?: number;

  @Column({ name: 'ebitda_multiple', type: 'decimal', precision: 8, scale: 2, nullable: true })
  ebitdaMultiple?: number;

  @Column({ name: 'user_multiple', type: 'decimal', precision: 8, scale: 2, nullable: true })
  userMultiple?: number;

  @Column({ name: 'book_multiple', type: 'decimal', precision: 8, scale: 2, nullable: true })
  bookMultiple?: number;

  // DCF specific fields
  @Column({ name: 'discount_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountRate?: number;

  @Column({ name: 'terminal_growth_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  terminalGrowthRate?: number;

  @Column({ name: 'projection_years', nullable: true })
  projectionYears?: number;

  @Column('jsonb', { name: 'cash_flow_projections', default: '{}' })
  cashFlowProjections: {
    year1?: number;
    year2?: number;
    year3?: number;
    year4?: number;
    year5?: number;
    terminalValue?: number;
  };

  // Comparable companies data
  @Column('jsonb', { name: 'comparable_companies', default: '[]' })
  comparableCompanies: Array<{
    name: string;
    ticker?: string;
    marketCap: number;
    revenue: number;
    revenueMultiple: number;
    ebitdaMultiple?: number;
    growthRate?: number;
  }>;

  // Risk factors and adjustments
  @Column({ name: 'risk_adjustment', type: 'decimal', precision: 5, scale: 2, nullable: true })
  riskAdjustment?: number; // Percentage adjustment for risk

  @Column({ name: 'liquidity_discount', type: 'decimal', precision: 5, scale: 2, nullable: true })
  liquidityDiscount?: number;

  @Column({ name: 'control_premium', type: 'decimal', precision: 5, scale: 2, nullable: true })
  controlPremium?: number;

  @Column({ name: 'marketability_discount', type: 'decimal', precision: 5, scale: 2, nullable: true })
  marketabilityDiscount?: number;

  @Column('text', { array: true, default: '{}' })
  riskFactors: string[];

  // Scenario analysis
  @Column('jsonb', { name: 'scenario_analysis', default: '{}' })
  scenarioAnalysis: {
    optimistic?: {
      probability: number;
      valuation: number;
      assumptions: string[];
    };
    base?: {
      probability: number;
      valuation: number;
      assumptions: string[];
    };
    pessimistic?: {
      probability: number;
      valuation: number;
      assumptions: string[];
    };
    weightedAverage?: number;
  };

  // Validation and confidence
  @Column({ name: 'confidence_level', type: 'decimal', precision: 3, scale: 2, default: 0.5 })
  confidenceLevel: number; // 0-1 scale

  @Column({ name: 'valuation_range_low', type: 'bigint', nullable: true })
  valuationRangeLow?: number;

  @Column({ name: 'valuation_range_high', type: 'bigint', nullable: true })
  valuationRangeHigh?: number;

  @Column('text', { array: true, default: '{}' })
  assumptions: string[];

  @Column('text', { array: true, default: '{}' })
  limitations: string[];

  // Source and methodology
  @Column({ name: 'valuation_firm', nullable: true })
  valuationFirm?: string;

  @Column({ name: 'valuation_analyst', nullable: true })
  valuationAnalyst?: string;

  @Column({ name: 'methodology_notes', nullable: true })
  methodologyNotes?: string;

  @Column('text', { array: true, default: '{}' })
  dataSourceUrls: string[];

  @Column('text', { array: true, default: '{}' })
  reportUrls: string[];

  // Regulatory and compliance
  @Column({ name: 'is_409a_valuation', default: false })
  is409aValuation: boolean;

  @Column({ name: 'is_audit_required', default: false })
  isAuditRequired: boolean;

  @Column({ name: 'regulatory_purpose', nullable: true })
  regulatoryPurpose?: string;

  @Column({ name: 'compliance_notes', nullable: true })
  complianceNotes?: string;

  // Market context
  @Column({ name: 'market_conditions', nullable: true })
  marketConditions?: string;

  @Column({ name: 'industry_outlook', nullable: true })
  industryOutlook?: string;

  @Column({ name: 'competitive_position', nullable: true })
  competitivePosition?: string;

  // Validation and approval
  @Column({ name: 'is_approved', default: false })
  isApproved: boolean;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy?: string;

  @Column({ name: 'approved_at', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'review_notes', nullable: true })
  reviewNotes?: string;

  // Additional metadata
  @Column('jsonb', { name: 'metadata', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => FundingRound, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'funding_round_id' })
  fundingRound?: FundingRound;

  // Virtual getters
  get amountFormatted(): string {
    return this.formatCurrency(this.amount, this.currency);
  }

  get valuationRangeFormatted(): string {
    if (!this.valuationRangeLow || !this.valuationRangeHigh) {
      return this.amountFormatted;
    }
    return `${this.formatCurrency(this.valuationRangeLow, this.currency)} - ${this.formatCurrency(this.valuationRangeHigh, this.currency)}`;
  }

  get methodDisplayName(): string {
    const methodNames = {
      [ValuationMethod.DISCOUNTED_CASH_FLOW]: 'Discounted Cash Flow',
      [ValuationMethod.COMPARABLE_COMPANIES]: 'Comparable Companies',
      [ValuationMethod.PRECEDENT_TRANSACTIONS]: 'Precedent Transactions',
      [ValuationMethod.RISK_ADJUSTED_NPV]: 'Risk-Adjusted NPV',
      [ValuationMethod.VENTURE_CAPITAL]: 'Venture Capital Method',
      [ValuationMethod.ASSET_BASED]: 'Asset-Based Valuation',
      [ValuationMethod.REVENUE_MULTIPLE]: 'Revenue Multiple',
      [ValuationMethod.USER_MULTIPLE]: 'User Multiple',
      [ValuationMethod.BERKUS_METHOD]: 'Berkus Method',
      [ValuationMethod.SCORECARD_METHOD]: 'Scorecard Method',
      [ValuationMethod.FIRST_CHICAGO]: 'First Chicago Method',
    };
    return methodNames[this.valuationMethod] || this.valuationMethod;
  }

  get typeDisplayName(): string {
    const typeNames = {
      [ValuationType.PRE_MONEY]: 'Pre-Money Valuation',
      [ValuationType.POST_MONEY]: 'Post-Money Valuation',
      [ValuationType.MARKET]: 'Market Valuation',
      [ValuationType.FAIR_VALUE]: 'Fair Value',
      [ValuationType.LIQUIDATION]: 'Liquidation Value',
      [ValuationType.BOOK_VALUE]: 'Book Value',
    };
    return typeNames[this.valuationType] || this.valuationType;
  }

  get ageInDays(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.valuationDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isRecent(): boolean {
    return this.ageInDays <= 90; // Within 3 months
  }

  get ltv_cac_ratio(): number | null {
    if (!this.lifetimeValue || !this.customerAcquisitionCost) return null;
    return this.lifetimeValue / this.customerAcquisitionCost;
  }

  get netCash(): number | null {
    if (this.cashBalance === null || this.cashBalance === undefined) return null;
    return this.cashBalance - (this.totalDebt || 0);
  }

  // Methods
  private formatCurrency(amount: number, currency: Currency): string {
    const value = amount / 100; // Convert from cents

    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B ${currency}`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M ${currency}`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K ${currency}`;
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  calculateWeightedValuation(): number {
    if (!this.scenarioAnalysis.optimistic || !this.scenarioAnalysis.base || !this.scenarioAnalysis.pessimistic) {
      return this.amount;
    }

    const weighted =
      (this.scenarioAnalysis.optimistic.valuation * this.scenarioAnalysis.optimistic.probability) +
      (this.scenarioAnalysis.base.valuation * this.scenarioAnalysis.base.probability) +
      (this.scenarioAnalysis.pessimistic.valuation * this.scenarioAnalysis.pessimistic.probability);

    this.scenarioAnalysis.weightedAverage = weighted;
    return weighted;
  }

  addComparableCompany(company: {
    name: string;
    ticker?: string;
    marketCap: number;
    revenue: number;
    revenueMultiple: number;
    ebitdaMultiple?: number;
    growthRate?: number;
  }): void {
    this.comparableCompanies.push(company);
  }

  calculateImpliedMultiples(): void {
    if (this.annualRevenue && this.annualRevenue > 0) {
      this.revenueMultiple = this.amount / this.annualRevenue;
    }

    if (this.ebitda && this.ebitda > 0) {
      this.ebitdaMultiple = this.amount / this.ebitda;
    }

    if (this.totalUsers && this.totalUsers > 0) {
      this.userMultiple = this.amount / this.totalUsers;
    }
  }

  applyRiskAdjustments(): number {
    let adjustedValuation = this.amount;

    if (this.riskAdjustment) {
      adjustedValuation *= (1 + this.riskAdjustment / 100);
    }

    if (this.liquidityDiscount) {
      adjustedValuation *= (1 - this.liquidityDiscount / 100);
    }

    if (this.marketabilityDiscount) {
      adjustedValuation *= (1 - this.marketabilityDiscount / 100);
    }

    if (this.controlPremium) {
      adjustedValuation *= (1 + this.controlPremium / 100);
    }

    return Math.round(adjustedValuation);
  }

  setScenarioAnalysis(
    optimistic: { probability: number; valuation: number; assumptions: string[] },
    base: { probability: number; valuation: number; assumptions: string[] },
    pessimistic: { probability: number; valuation: number; assumptions: string[] }
  ): void {
    this.scenarioAnalysis = {
      optimistic,
      base,
      pessimistic,
    };
    this.calculateWeightedValuation();
  }

  addAssumption(assumption: string): void {
    if (!this.assumptions.includes(assumption)) {
      this.assumptions.push(assumption);
    }
  }

  addLimitation(limitation: string): void {
    if (!this.limitations.includes(limitation)) {
      this.limitations.push(limitation);
    }
  }

  addRiskFactor(riskFactor: string): void {
    if (!this.riskFactors.includes(riskFactor)) {
      this.riskFactors.push(riskFactor);
    }
  }

  approve(approvedBy: string, notes?: string): void {
    this.isApproved = true;
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    if (notes) {
      this.reviewNotes = notes;
    }
  }

  updateConfidenceLevel(level: number): void {
    this.confidenceLevel = Math.max(0, Math.min(1, level));
  }

  setValuationRange(low: number, high: number): void {
    this.valuationRangeLow = Math.min(low, high);
    this.valuationRangeHigh = Math.max(low, high);

    // Set main valuation to midpoint if not already set
    if (!this.amount) {
      this.amount = Math.round((low + high) / 2);
    }
  }

  compareToMarket(marketValuation: number): {
    difference: number;
    percentageDifference: number;
    isOvervalued: boolean;
    isUndervalued: boolean;
  } {
    const difference = this.amount - marketValuation;
    const percentageDifference = (difference / marketValuation) * 100;

    return {
      difference,
      percentageDifference,
      isOvervalued: difference > 0,
      isUndervalued: difference < 0,
    };
  }

  calculateImpliedSharePrice(): number | null {
    if (!this.sharesOutstanding || this.sharesOutstanding === 0) return null;
    return this.amount / this.sharesOutstanding;
  }

  isMethodAppropriate(companyStage: string, hasRevenue: boolean): boolean {
    const stageMethodMap = {
      'idea': [ValuationMethod.BERKUS_METHOD, ValuationMethod.SCORECARD_METHOD],
      'mvp': [ValuationMethod.BERKUS_METHOD, ValuationMethod.SCORECARD_METHOD, ValuationMethod.VENTURE_CAPITAL],
      'growth': [ValuationMethod.REVENUE_MULTIPLE, ValuationMethod.DISCOUNTED_CASH_FLOW, ValuationMethod.COMPARABLE_COMPANIES],
      'mature': [ValuationMethod.DISCOUNTED_CASH_FLOW, ValuationMethod.COMPARABLE_COMPANIES, ValuationMethod.PRECEDENT_TRANSACTIONS],
    };

    const appropriateMethods = stageMethodMap[companyStage as keyof typeof stageMethodMap] || [];

    if (!hasRevenue && [ValuationMethod.REVENUE_MULTIPLE, ValuationMethod.DISCOUNTED_CASH_FLOW].includes(this.valuationMethod)) {
      return false;
    }

    return appropriateMethods.includes(this.valuationMethod);
  }

  toSummary() {
    return {
      id: this.id,
      startupId: this.startupId,
      valuationType: this.valuationType,
      typeDisplayName: this.typeDisplayName,
      valuationMethod: this.valuationMethod,
      methodDisplayName: this.methodDisplayName,
      amount: this.amountFormatted,
      valuationRange: this.valuationRangeFormatted,
      valuationDate: this.valuationDate,
      confidenceLevel: this.confidenceLevel,
      isApproved: this.isApproved,
      isRecent: this.isRecent,
      ageInDays: this.ageInDays,
      revenueMultiple: this.revenueMultiple,
      ebitdaMultiple: this.ebitdaMultiple,
      userMultiple: this.userMultiple,
    };
  }
}