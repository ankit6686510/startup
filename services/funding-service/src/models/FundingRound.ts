import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { FundingRound as FundingRoundType, Currency } from '@startup-platform/types';
import { Investment } from './Investment';
import { Valuation } from './Valuation';

@Entity('funding_rounds')
@Index(['roundType', 'announcedDate'])
@Index(['amount', 'currency'])
export class FundingRound {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'startup_id' })
  @Index()
  startupId: string;

  @Column({
    type: 'enum',
    enum: FundingRoundType,
    name: 'round_type',
  })
  @Index()
  roundType: FundingRoundType;

  @Column({ length: 200, nullable: true })
  name?: string; // e.g., "Series A", "Seed Round", custom name

  @Column('text', { nullable: true })
  description?: string;

  // Financial details
  @Column({ type: 'bigint' })
  @Index()
  amount: number; // Amount in smallest currency unit (cents for USD)

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.USD,
  })
  currency: Currency;

  @Column({ name: 'amount_usd', type: 'bigint', nullable: true })
  @Index()
  amountUsd?: number; // Converted to USD for comparison

  @Column({ name: 'pre_money_valuation', type: 'bigint', nullable: true })
  preMoneyValuation?: number;

  @Column({ name: 'post_money_valuation', type: 'bigint', nullable: true })
  postMoneyValuation?: number;

  @Column({ name: 'shares_issued', type: 'bigint', nullable: true })
  sharesIssued?: number;

  @Column({ name: 'price_per_share', type: 'decimal', precision: 15, scale: 6, nullable: true })
  pricePerShare?: number;

  // Dates
  @Column({ name: 'announced_date', nullable: true })
  @Index()
  announcedDate?: Date;

  @Column({ name: 'closed_date', nullable: true })
  closedDate?: Date;

  @Column({ name: 'expected_close_date', nullable: true })
  expectedCloseDate?: Date;

  // Status and metadata
  @Column({ name: 'is_confirmed', default: false })
  @Index()
  isConfirmed: boolean;

  @Column({ name: 'is_lead_investor_disclosed', default: false })
  isLeadInvestorDisclosed: boolean;

  @Column({ name: 'lead_investor_id', nullable: true })
  leadInvestorId?: string;

  @Column({ name: 'number_of_investors', default: 0 })
  numberOfInvestors: number;

  @Column({ name: 'minimum_investment', type: 'bigint', nullable: true })
  minimumInvestment?: number;

  @Column({ name: 'maximum_investment', type: 'bigint', nullable: true })
  maximumInvestment?: number;

  // Round characteristics
  @Column({ name: 'is_convertible', default: false })
  isConvertible: boolean;

  @Column({ name: 'is_equity', default: true })
  isEquity: boolean;

  @Column({ name: 'is_debt', default: false })
  isDebt: boolean;

  @Column({ name: 'is_safe', default: false })
  isSafe: boolean; // Simple Agreement for Future Equity

  @Column({ name: 'is_note', default: false })
  isNote: boolean; // Convertible note

  @Column({ name: 'interest_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  interestRate?: number; // For debt/notes

  @Column({ name: 'discount_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountRate?: number; // For convertible instruments

  @Column({ name: 'valuation_cap', type: 'bigint', nullable: true })
  valuationCap?: number; // For SAFEs and notes

  // Legal and compliance
  @Column('text', { array: true, default: '{}' })
  securityTypes: string[]; // Common, Preferred, etc.

  @Column('text', { array: true, default: '{}' })
  investorRights: string[]; // Board seats, voting rights, etc.

  @Column('text', { array: true, default: '{}' })
  liquidationPreferences: string[];

  @Column({ name: 'anti_dilution_protection', nullable: true })
  antiDilutionProtection?: string;

  @Column({ name: 'drag_along_rights', default: false })
  dragAlongRights: boolean;

  @Column({ name: 'tag_along_rights', default: false })
  tagAlongRights: boolean;

  @Column({ name: 'preemptive_rights', default: false })
  preemptiveRights: boolean;

  // Use of funds
  @Column('jsonb', { name: 'use_of_funds', default: '{}' })
  useOfFunds: {
    productDevelopment?: number;
    marketing?: number;
    hiring?: number;
    operations?: number;
    expansion?: number;
    technology?: number;
    other?: number;
    description?: string;
  };

  // Market and competition data
  @Column('text', { array: true, default: '{}' })
  competitors: string[];

  @Column('text', { array: true, default: '{}' })
  marketSegments: string[];

  @Column({ name: 'total_addressable_market', type: 'bigint', nullable: true })
  totalAddressableMarket?: number;

  // Source and verification
  @Column({ name: 'source', default: 'manual' })
  source: string; // manual, crunchbase, pitchbook, etc.

  @Column({ name: 'source_url', nullable: true })
  sourceUrl?: string;

  @Column({ name: 'source_reference_id', nullable: true })
  sourceReferenceId?: string;

  @Column({ name: 'verified_by', nullable: true })
  verifiedBy?: string; // User ID who verified

  @Column({ name: 'verified_at', nullable: true })
  verifiedAt?: Date;

  // Press and media
  @Column('text', { array: true, default: '{}' })
  pressUrls: string[];

  @Column('text', { array: true, default: '{}' })
  documentUrls: string[];

  // Additional metadata
  @Column('jsonb', { name: 'metadata', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Investment, (investment) => investment.fundingRound, { cascade: true })
  investments: Investment[];

  @OneToMany(() => Valuation, (valuation) => valuation.fundingRound)
  valuations: Valuation[];

  // Virtual getters
  get amountFormatted(): string {
    return this.formatCurrency(this.amount, this.currency);
  }

  get preMoneyValuationFormatted(): string {
    if (!this.preMoneyValuation) return 'Not disclosed';
    return this.formatCurrency(this.preMoneyValuation, this.currency);
  }

  get postMoneyValuationFormatted(): string {
    if (!this.postMoneyValuation) return 'Not disclosed';
    return this.formatCurrency(this.postMoneyValuation, this.currency);
  }

  get roundStage(): string {
    const stageMap = {
      [FundingRoundType.PRE_SEED]: 'Pre-Seed',
      [FundingRoundType.SEED]: 'Seed',
      [FundingRoundType.SERIES_A]: 'Series A',
      [FundingRoundType.SERIES_B]: 'Series B',
      [FundingRoundType.SERIES_C]: 'Series C',
      [FundingRoundType.SERIES_D]: 'Series D',
      [FundingRoundType.SERIES_E]: 'Series E',
      [FundingRoundType.SERIES_F]: 'Series F+',
      [FundingRoundType.BRIDGE]: 'Bridge',
      [FundingRoundType.GROWTH]: 'Growth',
      [FundingRoundType.IPO]: 'IPO',
      [FundingRoundType.DEBT]: 'Debt',
      [FundingRoundType.GRANT]: 'Grant',
      [FundingRoundType.BOOTSTRAPPED]: 'Bootstrapped',
    };
    return stageMap[this.roundType] || this.roundType;
  }

  get status(): string {
    if (this.closedDate) return 'Closed';
    if (this.announcedDate) return 'Announced';
    return 'Planned';
  }

  get daysSinceAnnouncement(): number {
    if (!this.announcedDate) return 0;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.announcedDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isCompleted(): boolean {
    return !!this.closedDate;
  }

  get ownershipDilution(): number {
    if (!this.preMoneyValuation || !this.amount) return 0;
    return (this.amount / (this.preMoneyValuation + this.amount)) * 100;
  }

  // Methods
  private formatCurrency(amount: number, currency: Currency): string {
    const value = amount / 100; // Convert from cents
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  calculatePostMoneyValuation(): number {
    if (this.postMoneyValuation) return this.postMoneyValuation;
    if (this.preMoneyValuation && this.amount) {
      return this.preMoneyValuation + this.amount;
    }
    return 0;
  }

  updateConfirmationStatus(isConfirmed: boolean, verifiedBy?: string): void {
    this.isConfirmed = isConfirmed;
    if (isConfirmed) {
      this.verifiedBy = verifiedBy;
      this.verifiedAt = new Date();
    }
  }

  addInvestorCount(count: number = 1): void {
    this.numberOfInvestors += count;
  }

  setLeadInvestor(investorId: string): void {
    this.leadInvestorId = investorId;
    this.isLeadInvestorDisclosed = true;
  }

  addUseOfFunds(category: keyof FundingRound['useOfFunds'], amount: number): void {
    if (!(this.useOfFunds as any)[category]) {
      (this.useOfFunds as any)[category] = 0;
    }
    (this.useOfFunds as any)[category] = ((this.useOfFunds as any)[category] as number) + amount;
  }

  getUseOfFundsPercentage(category: keyof FundingRound['useOfFunds']): number {
    const categoryAmount = this.useOfFunds[category] as number;
    if (!categoryAmount || this.amount === 0) return 0;
    return (categoryAmount / this.amount) * 100;
  }

  addPressUrl(url: string): void {
    if (!this.pressUrls.includes(url)) {
      this.pressUrls.push(url);
    }
  }

  addDocumentUrl(url: string): void {
    if (!this.documentUrls.includes(url)) {
      this.documentUrls.push(url);
    }
  }

  toPublicSummary() {
    return {
      id: this.id,
      startupId: this.startupId,
      roundType: this.roundType,
      roundStage: this.roundStage,
      amount: this.amountFormatted,
      currency: this.currency,
      preMoneyValuation: this.preMoneyValuationFormatted,
      postMoneyValuation: this.postMoneyValuationFormatted,
      announcedDate: this.announcedDate,
      closedDate: this.closedDate,
      status: this.status,
      numberOfInvestors: this.numberOfInvestors,
      isConfirmed: this.isConfirmed,
      isLeadInvestorDisclosed: this.isLeadInvestorDisclosed,
    };
  }
}
