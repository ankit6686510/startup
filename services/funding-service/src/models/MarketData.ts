import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  Index
} from 'typeorm';

export enum MarketDataType {
  FUNDING_TRENDS = 'funding_trends',
  VALUATION_MULTIPLES = 'valuation_multiples',
  INDUSTRY_BENCHMARKS = 'industry_benchmarks',
  ECONOMIC_INDICATORS = 'economic_indicators',
  VENTURE_CAPITAL_ACTIVITY = 'vc_activity',
  IPO_ACTIVITY = 'ipo_activity',
  M_A_ACTIVITY = 'ma_activity',
  CURRENCY_RATES = 'currency_rates'
}

@Entity('market_data')
@Index(['data_type'])
@Index(['industry'])
@Index(['geography'])
@Index(['date'])
export class MarketData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MarketDataType,
    name: 'data_type'
  })
  @Index()
  dataType: MarketDataType;

  @Column({ nullable: true })
  @Index()
  industry?: string;

  @Column({ nullable: true })
  @Index()
  geography?: string; // US, Europe, Asia, Global, etc.

  @Column({ nullable: true })
  stage?: string; // Seed, Series A, etc.

  @Column()
  @Index()
  date: Date;

  @Column({ name: 'period_type', default: 'quarterly' })
  periodType: string; // daily, weekly, monthly, quarterly, yearly

  // Funding metrics
  @Column({ name: 'total_funding_amount', type: 'bigint', nullable: true })
  totalFundingAmount?: number;

  @Column({ name: 'number_of_deals', nullable: true })
  numberOfDeals?: number;

  @Column({ name: 'average_deal_size', type: 'bigint', nullable: true })
  averageDealSize?: number;

  @Column({ name: 'median_deal_size', type: 'bigint', nullable: true })
  medianDealSize?: number;

  @Column({ name: 'largest_deal_size', type: 'bigint', nullable: true })
  largestDealSize?: number;

  @Column({ name: 'number_of_investors', nullable: true })
  numberOfInvestors?: number;

  @Column({ name: 'number_of_new_investors', nullable: true })
  numberOfNewInvestors?: number;

  // Valuation metrics
  @Column({ name: 'average_pre_money_valuation', type: 'bigint', nullable: true })
  averagePreMoneyValuation?: number;

  @Column({ name: 'median_pre_money_valuation', type: 'bigint', nullable: true })
  medianPreMoneyValuation?: number;

  @Column({ name: 'average_post_money_valuation', type: 'bigint', nullable: true })
  averagePostMoneyValuation?: number;

  @Column({ name: 'median_post_money_valuation', type: 'bigint', nullable: true })
  medianPostMoneyValuation?: number;

  // Valuation multiples
  @Column({ name: 'average_revenue_multiple', type: 'decimal', precision: 8, scale: 2, nullable: true })
  averageRevenueMultiple?: number;

  @Column({ name: 'median_revenue_multiple', type: 'decimal', precision: 8, scale: 2, nullable: true })
  medianRevenueMultiple?: number;

  @Column({ name: 'average_ebitda_multiple', type: 'decimal', precision: 8, scale: 2, nullable: true })
  averageEbitdaMultiple?: number;

  @Column({ name: 'median_ebitda_multiple', type: 'decimal', precision: 8, scale: 2, nullable: true })
  medianEbitdaMultiple?: number;

  @Column({ name: 'average_user_multiple', type: 'decimal', precision: 8, scale: 2, nullable: true })
  averageUserMultiple?: number;

  @Column({ name: 'median_user_multiple', type: 'decimal', precision: 8, scale: 2, nullable: true })
  medianUserMultiple?: number;

  // Time to funding metrics
  @Column({ name: 'average_time_to_funding_days', nullable: true })
  averageTimeToFundingDays?: number;

  @Column({ name: 'median_time_to_funding_days', nullable: true })
  medianTimeToFundingDays?: number;

  @Column({ name: 'average_due_diligence_days', nullable: true })
  averageDueDiligenceDays?: number;

  // Success and failure rates
  @Column({ name: 'success_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  successRate?: number; // Percentage of companies that get funded

  @Column({ name: 'failure_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  failureRate?: number; // Percentage of companies that fail

  @Column({ name: 'exit_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  exitRate?: number; // Percentage of companies that exit

  @Column({ name: 'ipo_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  ipoRate?: number;

  @Column({ name: 'acquisition_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  acquisitionRate?: number;

  // Economic indicators
  @Column({ name: 'gdp_growth_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  gdpGrowthRate?: number;

  @Column({ name: 'inflation_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  inflationRate?: number;

  @Column({ name: 'interest_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  interestRate?: number;

  @Column({ name: 'unemployment_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  unemploymentRate?: number;

  @Column({ name: 'stock_market_index', type: 'decimal', precision: 10, scale: 2, nullable: true })
  stockMarketIndex?: number;

  @Column({ name: 'venture_capital_index', type: 'decimal', precision: 10, scale: 2, nullable: true })
  ventureCapitalIndex?: number;

  // Currency exchange rates
  @Column('jsonb', { name: 'exchange_rates', default: '{}' })
  exchangeRates: Record<string, number>; // Currency code to USD rate

  // Industry-specific metrics
  @Column('jsonb', { name: 'industry_metrics', default: '{}' })
  industryMetrics: {
    averageCAC?: number; // Customer Acquisition Cost
    averageLTV?: number; // Lifetime Value
    averageChurnRate?: number;
    averageGrowthRate?: number;
    averageBurnRate?: number;
    averageRunwayMonths?: number;
    averageEmployeeCount?: number;
    averageFounderAge?: number;
    averageTeamSize?: number;
  };

  // Trend indicators
  @Column({ name: 'quarter_over_quarter_growth', type: 'decimal', precision: 5, scale: 2, nullable: true })
  quarterOverQuarterGrowth?: number;

  @Column({ name: 'year_over_year_growth', type: 'decimal', precision: 5, scale: 2, nullable: true })
  yearOverYearGrowth?: number;

  @Column({ name: 'trend_direction', nullable: true })
  trendDirection?: 'up' | 'down' | 'stable';

  @Column({ name: 'volatility_index', type: 'decimal', precision: 5, scale: 2, nullable: true })
  volatilityIndex?: number;

  // Market sentiment
  @Column({ name: 'investor_sentiment_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  investorSentimentScore?: number; // -1 to 1 scale

  @Column({ name: 'market_confidence_index', type: 'decimal', precision: 5, scale: 2, nullable: true })
  marketConfidenceIndex?: number; // 0-100 scale

  @Column({ name: 'risk_appetite_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  riskAppetiteScore?: number; // 0-1 scale

  // Competition and market dynamics
  @Column({ name: 'market_concentration_index', type: 'decimal', precision: 5, scale: 2, nullable: true })
  marketConcentrationIndex?: number; // Herfindahl-Hirschman Index

  @Column({ name: 'new_entrants_count', nullable: true })
  newEntrantsCount?: number;

  @Column({ name: 'market_exits_count', nullable: true })
  marketExitsCount?: number;

  @Column({ name: 'competitive_intensity_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  competitiveIntensityScore?: number; // 0-1 scale

  // Data quality and source
  @Column({ name: 'data_source', default: 'aggregated' })
  dataSource: string;

  @Column({ name: 'sample_size', nullable: true })
  sampleSize?: number;

  @Column({ name: 'confidence_interval', type: 'decimal', precision: 3, scale: 2, nullable: true })
  confidenceInterval?: number;

  @Column({ name: 'data_quality_score', type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  dataQualityScore: number; // 0-1 scale

  @Column('text', { array: true, default: '{}' })
  sourceUrls: string[];

  @Column('text', { array: true, default: '{}' })
  methodologyNotes: string[];

  // Additional metadata
  @Column('jsonb', { name: 'metadata', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual getters
  get isRecent(): boolean {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    switch (this.periodType) {
      case 'daily': return diffDays <= 7;
      case 'weekly': return diffDays <= 30;
      case 'monthly': return diffDays <= 90;
      case 'quarterly': return diffDays <= 180;
      case 'yearly': return diffDays <= 365;
      default: return diffDays <= 90;
    }
  }

  get marketHealthScore(): number {
    let score = 50; // Base score

    // Funding activity impact
    if (this.quarterOverQuarterGrowth) {
      score += Math.min(this.quarterOverQuarterGrowth * 2, 20);
    }

    // Valuation stability impact
    if (this.volatilityIndex) {
      score -= Math.min(this.volatilityIndex * 10, 15);
    }

    // Investor sentiment impact
    if (this.investorSentimentScore) {
      score += this.investorSentimentScore * 25;
    }

    // Success rate impact
    if (this.successRate) {
      score += (this.successRate - 50) * 0.3;
    }

    return Math.max(0, Math.min(100, score));
  }

  get trendStrength(): 'weak' | 'moderate' | 'strong' {
    if (!this.quarterOverQuarterGrowth) return 'weak';
    
    const absGrowth = Math.abs(this.quarterOverQuarterGrowth);
    if (absGrowth < 5) return 'weak';
    if (absGrowth < 15) return 'moderate';
    return 'strong';
  }

  get marketPhase(): 'bull' | 'bear' | 'sideways' {
    if (!this.yearOverYearGrowth) return 'sideways';
    
    if (this.yearOverYearGrowth > 10) return 'bull';
    if (this.yearOverYearGrowth < -10) return 'bear';
    return 'sideways';
  }

  // Methods
  calculateGrowthRate(previousPeriodValue: number, currentPeriodValue: number): number {
    if (previousPeriodValue === 0) return 0;
    return ((currentPeriodValue - previousPeriodValue) / previousPeriodValue) * 100;
  }

  updateTrendDirection(): void {
    if (!this.quarterOverQuarterGrowth) {
      this.trendDirection = 'stable';
      return;
    }

    if (this.quarterOverQuarterGrowth > 2) {
      this.trendDirection = 'up';
    } else if (this.quarterOverQuarterGrowth < -2) {
      this.trendDirection = 'down';
    } else {
      this.trendDirection = 'stable';
    }
  }

  calculateVolatilityIndex(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    this.volatilityIndex = (standardDeviation / mean) * 100;
    return this.volatilityIndex;
  }

  updateMarketSentiment(sentimentScore: number): void {
    this.investorSentimentScore = Math.max(-1, Math.min(1, sentimentScore));
    
    // Update market confidence based on sentiment
    this.marketConfidenceIndex = ((sentimentScore + 1) / 2) * 100;
  }

  addIndustryMetric(metric: keyof MarketData['industryMetrics'], value: number): void {
    this.industryMetrics[metric] = value;
  }

  compareToHistorical(historicalData: MarketData[]): {
    percentile: number;
    isAboveAverage: boolean;
    historicalAverage: number;
  } {
    if (historicalData.length === 0 || !this.totalFundingAmount) {
      return { percentile: 50, isAboveAverage: false, historicalAverage: 0 };
    }

    const values = historicalData
      .map(data => data.totalFundingAmount)
      .filter(val => val !== null && val !== undefined) as number[];

    if (values.length === 0) {
      return { percentile: 50, isAboveAverage: false, historicalAverage: 0 };
    }

    values.sort((a, b) => a - b);
    const historicalAverage = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    const belowCount = values.filter(val => val < this.totalFundingAmount!).length;
    const percentile = (belowCount / values.length) * 100;
    
    return {
      percentile,
      isAboveAverage: this.totalFundingAmount > historicalAverage,
      historicalAverage,
    };
  }

  predictNextPeriod(historicalData: MarketData[]): {
    predictedValue: number;
    confidenceInterval: { lower: number; upper: number };
    methodology: string;
  } {
    if (historicalData.length < 3 || !this.totalFundingAmount) {
      return {
        predictedValue: this.totalFundingAmount || 0,
        confidenceInterval: { lower: 0, upper: 0 },
        methodology: 'insufficient_data',
      };
    }

    // Simple linear trend prediction
    const values = historicalData
      .map(data => data.totalFundingAmount)
      .filter(val => val !== null && val !== undefined) as number[];

    const n = values.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + val * (index + 1), 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const predictedValue = slope * (n + 1) + intercept;
    
    // Calculate confidence interval (simplified)
    const residuals = values.map((val, index) => val - (slope * (index + 1) + intercept));
    const mse = residuals.reduce((sum, res) => sum + res * res, 0) / (n - 2);
    const standardError = Math.sqrt(mse);
    
    return {
      predictedValue: Math.max(0, predictedValue),
      confidenceInterval: {
        lower: Math.max(0, predictedValue - 1.96 * standardError),
        upper: predictedValue + 1.96 * standardError,
      },
      methodology: 'linear_trend',
    };
  }

  isOutlier(historicalData: MarketData[]): boolean {
    if (!this.totalFundingAmount || historicalData.length < 5) return false;

    const values = historicalData
      .map(data => data.totalFundingAmount)
      .filter(val => val !== null && val !== undefined) as number[];

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    const zScore = Math.abs((this.totalFundingAmount - mean) / standardDeviation);
    return zScore > 2; // More than 2 standard deviations from mean
  }

  generateInsights(): string[] {
    const insights: string[] = [];

    if (this.quarterOverQuarterGrowth && this.quarterOverQuarterGrowth > 20) {
      insights.push('Exceptional quarter-over-quarter growth indicates a very hot market');
    }

    if (this.successRate && this.successRate < 20) {
      insights.push('Low success rate suggests challenging funding environment');
    }

    if (this.averageTimeToFundingDays && this.averageTimeToFundingDays > 180) {
      insights.push('Extended funding cycles indicate increased due diligence requirements');
    }

    if (this.investorSentimentScore && this.investorSentimentScore < -0.5) {
      insights.push('Negative investor sentiment may impact future funding availability');
    }

    if (this.volatilityIndex && this.volatilityIndex > 30) {
      insights.push('High market volatility suggests uncertain conditions');
    }

    return insights;
  }

  toSummary() {
    return {
      id: this.id,
      dataType: this.dataType,
      industry: this.industry,
      geography: this.geography,
      stage: this.stage,
      date: this.date,
      periodType: this.periodType,
      totalFundingAmount: this.totalFundingAmount,
      numberOfDeals: this.numberOfDeals,
      averageDealSize: this.averageDealSize,
      averagePreMoneyValuation: this.averagePreMoneyValuation,
      averageRevenueMultiple: this.averageRevenueMultiple,
      successRate: this.successRate,
      quarterOverQuarterGrowth: this.quarterOverQuarterGrowth,
      yearOverYearGrowth: this.yearOverYearGrowth,
      trendDirection: this.trendDirection,
      marketHealthScore: this.marketHealthScore,
      marketPhase: this.marketPhase,
      isRecent: this.isRecent,
      investorSentimentScore: this.investorSentimentScore,
      dataQualityScore: this.dataQualityScore,
    };
  }
}