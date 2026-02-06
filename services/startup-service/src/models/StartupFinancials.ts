import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Startup } from './Startup';

export enum FinancialReportType {
    QUARTERLY = 'QUARTERLY',
    ANNUAL = 'ANNUAL',
    MONTHLY = 'MONTHLY',
    OTHER = 'OTHER',
}

export enum AccessLevel {
    PUBLIC = 'PUBLIC',
    VERIFIED_INVESTOR = 'VERIFIED_INVESTOR',
    PRIVATE = 'PRIVATE', // Team only
}

@Entity('startup_financials')
export class StartupFinancials {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'startup_id' })
    @Index()
    startupId: string;

    @Column()
    title: string;

    @Column({ name: 'period_start' })
    periodStart: Date;

    @Column({ name: 'period_end' })
    periodEnd: Date;

    @Column({
        type: 'enum',
        enum: FinancialReportType,
    })
    type: FinancialReportType;

    // Key metrics (optional, as they might be in the document)
    @Column('decimal', { nullable: true, precision: 15, scale: 2 })
    revenue: number;

    @Column('decimal', { nullable: true, precision: 15, scale: 2 })
    burnRate: number;

    @Column('decimal', { nullable: true, precision: 15, scale: 2 })
    netIncome: number;

    @Column('decimal', { nullable: true, precision: 15, scale: 2 })
    cashOp: number; // Cash on hand

    @Column({ nullable: true })
    currency: string; // USD, EUR, etc.

    @Column({ name: 'document_url', nullable: true })
    documentUrl: string; // S3 link to PDF/Excel

    @Column({
        type: 'enum',
        enum: AccessLevel,
        default: AccessLevel.PRIVATE,
    })
    accessLevel: AccessLevel;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Startup, (startup) => startup.financials, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'startup_id' })
    startup: Startup;
}
