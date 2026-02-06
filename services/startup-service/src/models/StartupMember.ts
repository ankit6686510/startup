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

export enum StartupRole {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    RECRUITER = 'RECRUITER',
    EDITOR = 'EDITOR',
    VIEWER = 'VIEWER',
}

@Entity('startup_members')
@Index(['startupId', 'userId'], { unique: true })
export class StartupMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'startup_id' })
    startupId: string;

    @Column({ name: 'user_id' })
    userId: string; // FK to User Service (managed via API calls, but stored here for reference)

    @Column({
        type: 'enum',
        enum: StartupRole,
        default: StartupRole.VIEWER,
    })
    role: StartupRole;

    @Column('jsonb', { nullable: true })
    permissions: Record<string, boolean>; // Granular permission overrides

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    invitedBy: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Startup, (startup) => startup.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'startup_id' })
    startup: Startup;
}
