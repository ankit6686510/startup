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

export enum MilestoneType {
    FOUNDING = 'FOUNDING',
    FUNDING = 'FUNDING',
    PRODUCT_LAUNCH = 'PRODUCT_LAUNCH',
    USER_GROWTH = 'USER_GROWTH',
    ACQUISITION = 'ACQUISITION',
    AWARD = 'AWARD',
    OTHER = 'OTHER',
}

@Entity('startup_milestones')
@Index(['startupId', 'date'])
export class StartupMilestone {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'startup_id' })
    startupId: string;

    @Column()
    title: string;

    @Column('text', { nullable: true })
    description: string;

    @Column({ type: 'date' })
    date: Date;

    @Column({
        type: 'enum',
        enum: MilestoneType,
        default: MilestoneType.OTHER,
    })
    type: MilestoneType;

    @Column({ nullable: true })
    imageUrl: string;

    @Column({ default: true })
    isVisible: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Startup, (startup) => startup.milestones, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'startup_id' })
    startup: Startup;
}
