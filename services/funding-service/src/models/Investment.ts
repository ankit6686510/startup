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
import { Investor } from './Investor';

@Entity('investments')
@Index(['funding_round_id'])
@Index(['investor_id'])
@Index(['investment_date'])
@Index(['amount'])
export class Investment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'funding_round_id' })
  fundingRoundId: string;

  @Column({ name: 'investor_id' })
  investorId: string;

  // Investment details
  @Column({ type: 'bigint', nullable: true })
  @Index()
  amount?: number; // Amount invested in smallest currency unit

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.USD
  })
  currency: Currency;

  @Column({ name: 'amount_usd', type: 'bigint', nullable: true })
  amountUsd?: number; // Converted to USD for comparison

  @Column({ name: 'shares_acquired', type: 'bigint', nullable: true })
  sharesAcquired?: number;

  @Column({ name: 'ownership_percentage', type: 'decimal', precision: 8, scale: 5, nullable: true })
  ownershipPercentage?: number; // Percentage of company owned

  @Column({ name: 'price_per_share', type: 'decimal', precision: 15, scale: 6, nullable: true })
  pricePerShare?: number;

  @Column({ name: 'investment_date', nullable: true })
  @Index()
  investmentDate?: Date;

  // Investment role and characteristics
  @Column({ name: 'is_lead_investor', default: false })
  isLeadInvestor: boolean;

  @Column({ name: 'is_follow_on', default: false })
  isFollowOn: boolean; // Follow-on investment from previous round

  @Column({ name: 'is_pro_rata', default: false })
  isProRata: boolean; // Pro-rata rights exercise

  @Column({ name: 'is_insider', default: false })
  isInsider: boolean; // Existing investor participating

  @Column({ name: 'is_new_investor', default: true })
  isNewInvestor: boolean;

  // Investment type and structure
  @Column({ name: 'security_type', default: 'equity' })
  securityType: string; // equity, convertible_note, safe, etc.

  @Column({ name: 'is_convertible', default: false })
  isConvertible: boolean;

  @Column({ name: 'conversion_terms', nullable: true })
  conversionTerms?: string;

  @Column({ name: 'liquidation_preference', type: 'decimal', precision: 3, scale: 2, nullable: true })
  liquidationPreference?: number; // 1.0 = 1x preference

  @Column({ name: 'dividend_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  dividendRate?: number; // Annual dividend percentage

  @Column({ name: 'anti_dilution_protection', nullable: true })
  antiDilutionProtection?: string; // weighted_average, full_ratchet, none

  // Board and governance rights
  @Column({ name: 'board_seats', default: 0 })
  boardSeats: number;

  @Column({ name: 'observer_rights', default: false })
  observerRights: boolean;

  @Column({ name: 'voting_rights', default: false })
  votingRights: boolean;

  @Column({ name: 'consent_rights', default: false })
  consentRights: boolean;

  @Column({ name: 'information_rights', default: false })
  informationRights: boolean;

  @Column({ name: 'preemptive_rights', default: false })
  preemptiveRights: boolean;

  @Column({ name: 'drag_along_rights', default: false })
  dragAlongRights: boolean;

  @Column({ name: 'tag_along_rights', default: false })
  tagAlongRights: boolean;

  // Valuation at time of investment
  @Column({ name: 'pre_money_valuation', type: 'bigint', nullable: true })
  preMoneyValuation?: number;

  @Column({ name: 'post_money_valuation', type: 'bigint', nullable: true })
  postMoneyValuation?: number;

  @Column({ name: 'valuation_multiple', type: 'decimal', precision: 10, scale: 2, nullable: true })
  valuationMultiple?: number; // Revenue multiple at time of investment

  // Performance tracking
  @Column({ name: 'current_value', type: 'bigint', nullable: true })
  currentValue?: number;

  @Column({ name: 'last_valuation_date', nullable: true })
  lastValuationDate?: Date;

  @Column({ name: 'unrealized_gain_loss', type: 'bigint', nullable: true })
  unrealizedGainLoss?: number;

  @Column({ name: 'realized_gain_loss', type: 'bigint', nullable: true })
  realizedGainLoss?: number;

  @Column({ name: 'internal_rate_of_return', type: 'decimal', precision: 8, scale: 4, nullable: true })
  internalRateOfReturn?: number; // IRR percentage

  @Column({ name: 'money_multiple', type: 'decimal', precision: 8, scale: 4, nullable: true })
  moneyMultiple?: number; // Current value / invested amount

  // Exit information
  @Column({ name: 'exit_date', nullable: true })
  exitDate?: Date;

  @Column({ name: 'exit_valuation', type: 'bigint', nullable: true })
  exitValuation?: number;

  @Column({ name: 'exit_proceeds', type: 'bigint', nullable: true })
  exitProceeds?: number;

  @Column({ name: 'exit_type', nullable: true })
  exitType?: string; // ipo, acquisition, secondary_sale, etc.

  @Column({ name: 'exit_multiple', type: 'decimal', precision: 8, scale: 4, nullable: true })
  exitMultiple?: number;

  // Status and lifecycle
  @Column({ name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @Column({ name: 'is_written_off', default: false })
  isWrittenOff: boolean;

  @Column({ name: 'write_off_date', nullable: true })
  writeOffDate?: Date;

  @Column({ name: 'write_off_reason', nullable: true })
  writeOffReason?: string;

  // Due diligence and documentation
  @Column({ name: 'due_diligence_completed', default: false })
  dueDiligenceCompleted: boolean;

  @Column({ name: 'legal_docs_signed', default: false })
  legalDocsSigned: boolean;

  @Column({ name: 'funds_transferred', default: false })
  fundsTransferred: boolean;

  @Column('text', { array: true, default: '{}' })
  documentUrls: string[];

  @Column('text', { array: true, default: '{}' })
  legalDocuments: string[];

  // Investor relations
  @Column({ name: 'last_update_sent', nullable: true })
  lastUpdateSent?: Date;

  @Column({ name: 'updates_frequency', nullable: true })
  updatesFrequency?: string; // monthly, quarterly, etc.

  @Column({ name: 'investor_feedback', nullable: true })
  investorFeedback?: string;

  @Column({ name: 'investor_satisfaction_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  investorSatisfactionScore?: number; // 1-10 scale

  // Commitment and milestones
  @Column({ name: 'committed_amount', type: 'bigint', nullable: true })
  committedAmount?: number;

  @Column({ name: 'called_amount', type: 'bigint', nullable: true })
  calledAmount?: number;

  @Column({ name: 'remaining_commitment', type: 'bigint', nullable: true })
  remainingCommitment?: number;

  @Column('jsonb', { name: 'milestones', default: '{}' })
  milestones: {
    due_diligence_start?: Date;
    term_sheet_signed?: Date;
    legal_docs_executed?: Date;
    funds_wired?: Date;
    board_seat_filled?: Date;
  };

  // Source and verification
  @Column({ name: 'data_source', default: 'manual' })
  dataSource: string;

  @Column({ name: 'source_reference_id', nullable: true })
  sourceReferenceId?: string;

  @Column({ name: 'verified_by', nullable: true })
  verifiedBy?: string;

  @Column({ name: 'verified_at', nullable: true })
  verifiedAt?: Date;

  @Column({ name: 'confidence_level', type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  confidenceLevel: number; // 0-1 scale

  // Additional metadata
  @Column('jsonb', { name: 'metadata', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => FundingRound, fundingRound => fundingRound.investments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'funding_round_id' })
  fundingRound: FundingRound;

  @ManyToOne(() => Investor, investor => investor.investments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'investor_id' })
  investor: Investor;

  // Virtual getters
  get amountFormatted(): string {
    if (!this.amount) return 'Not disclosed';
    return this.formatCurrency(this.amount, this.currency);
  }

  get currentValueFormatted(): string {
    if (!this.currentValue) return 'Not available';
    return this.formatCurrency(this.currentValue, this.currency);
  }

  get returnOnInvestment(): number {
    if (!this.amount || !this.currentValue) return 0;
    return ((this.currentValue - this.amount) / this.amount) * 100;
  }

  get investmentAge(): number {
    if (!this.investmentDate) return 0;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.investmentDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get investmentAgeYears(): number {
    return this.investmentAge / 365;
  }

  get isExited(): boolean {
    return !!this.exitDate;
  }

  get status(): string {
    if (this.isWrittenOff) return 'Written Off';
    if (this.isExited) return 'Exited';
    if (!this.fundsTransferred) return 'Committed';
    if (!this.legalDocsSigned) return 'In Legal';
    if (!this.dueDiligenceCompleted) return 'Due Diligence';
    return 'Active';
  }

  get fundingProgress(): number {
    if (!this.committedAmount) return this.fundsTransferred ? 100 : 0;
    if (!this.calledAmount) return 0;
    return (this.calledAmount / this.committedAmount) * 100;
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

  calculateCurrentValue(marketValuation?: number): void {
    if (!this.ownershipPercentage || !marketValuation) return;
    
    this.currentValue = Math.round(marketValuation * (this.ownershipPercentage / 100));
    this.lastValuationDate = new Date();
    
    if (this.amount) {
      this.unrealizedGainLoss = this.currentValue - this.amount;
      this.moneyMultiple = this.currentValue / this.amount;
      
      // Calculate annualized IRR
      if (this.investmentDate) {
        const years = this.investmentAgeYears;
        if (years > 0) {
          this.internalRateOfReturn = Math.pow(this.moneyMultiple, 1 / years) - 1;
        }
      }
    }
  }

  recordExit(exitValuation: number, exitProceeds: number, exitType: string): void {
    this.exitDate = new Date();
    this.exitValuation = exitValuation;
    this.exitProceeds = exitProceeds;
    this.exitType = exitType;
    this.isActive = false;
    
    if (this.amount) {
      this.exitMultiple = exitProceeds / this.amount;
      this.realizedGainLoss = exitProceeds - this.amount;
      
      // Calculate final IRR
      if (this.investmentDate) {
        const years = (this.exitDate.getTime() - this.investmentDate.getTime()) / (365 * 24 * 60 * 60 * 1000);
        if (years > 0) {
          this.internalRateOfReturn = Math.pow(this.exitMultiple, 1 / years) - 1;
        }
      }
    }
  }

  writeOff(reason: string): void {
    this.isWrittenOff = true;
    this.writeOffDate = new Date();
    this.writeOffReason = reason;
    this.currentValue = 0;
    this.isActive = false;
    
    if (this.amount) {
      this.realizedGainLoss = -this.amount;
      this.moneyMultiple = 0;
      this.internalRateOfReturn = -1;
    }
  }

  updateMilestone(milestone: keyof Investment['milestones'], date: Date = new Date()): void {
    this.milestones[milestone] = date;
    
    // Auto-update related flags
    switch (milestone) {
      case 'legal_docs_executed':
        this.legalDocsSigned = true;
        break;
      case 'funds_wired':
        this.fundsTransferred = true;
        break;
    }
  }

  callCommitment(amount: number): void {
    if (!this.committedAmount) return;
    
    this.calledAmount = (this.calledAmount || 0) + amount;
    this.remainingCommitment = this.committedAmount - this.calledAmount;
    
    if (this.remainingCommitment < 0) {
      this.remainingCommitment = 0;
    }
  }

  setCommitment(committedAmount: number): void {
    this.committedAmount = committedAmount;
    this.calledAmount = this.calledAmount || 0;
    this.remainingCommitment = committedAmount - this.calledAmount;
  }

  updateInvestorSatisfaction(score: number, feedback?: string): void {
    this.investorSatisfactionScore = Math.max(0, Math.min(10, score));
    if (feedback) {
      this.investorFeedback = feedback;
    }
  }

  sendUpdate(): void {
    this.lastUpdateSent = new Date();
  }

  addDocument(url: string, type: 'general' | 'legal' = 'general'): void {
    if (type === 'legal') {
      if (!this.legalDocuments.includes(url)) {
        this.legalDocuments.push(url);
      }
    } else {
      if (!this.documentUrls.includes(url)) {
        this.documentUrls.push(url);
      }
    }
  }

  verify(verifiedBy: string, confidenceLevel: number = 1.0): void {
    this.verifiedBy = verifiedBy;
    this.verifiedAt = new Date();
    this.confidenceLevel = Math.max(0, Math.min(1, confidenceLevel));
  }

  calculateOwnershipDilution(newFundingRound: FundingRound): number {
    if (!this.ownershipPercentage || !newFundingRound.amount || !newFundingRound.preMoneyValuation) {
      return 0;
    }
    
    const preMoneyShares = newFundingRound.preMoneyValuation / newFundingRound.pricePerShare!;
    const newShares = newFundingRound.amount / newFundingRound.pricePerShare!;
    const totalShares = preMoneyShares + newShares;
    
    const currentShares = (this.ownershipPercentage / 100) * preMoneyShares;
    const newOwnershipPercentage = (currentShares / totalShares) * 100;
    
    return this.ownershipPercentage - newOwnershipPercentage;
  }

  isOutperforming(benchmarkIRR: number = 0.25): boolean {
    return this.internalRateOfReturn ? this.internalRateOfReturn > benchmarkIRR : false;
  }

  getDaysToExit(): number | null {
    if (!this.isExited || !this.investmentDate || !this.exitDate) return null;
    return Math.ceil((this.exitDate.getTime() - this.investmentDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  toSummary() {
    return {
      id: this.id,
      amount: this.amountFormatted,
      currency: this.currency,
      investmentDate: this.investmentDate,
      ownershipPercentage: this.ownershipPercentage,
      isLeadInvestor: this.isLeadInvestor,
      securityType: this.securityType,
      status: this.status,
      currentValue: this.currentValueFormatted,
      returnOnInvestment: this.returnOnInvestment,
      moneyMultiple: this.moneyMultiple,
      internalRateOfReturn: this.internalRateOfReturn,
      investmentAge: this.investmentAge,
      isActive: this.isActive,
      isExited: this.isExited,
    };
  }
}