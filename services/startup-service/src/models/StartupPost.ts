import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
    OneToMany,
} from 'typeorm';
import { Startup } from './Startup';

export enum PostType {
    UPDATE = 'UPDATE',
    MILESTONE = 'MILESTONE',
    JOB_HIGHLIGHT = 'JOB_HIGHLIGHT',
    ARTICLE = 'ARTICLE',
    POLL = 'POLL',
}

export enum PostVisibility {
    PUBLIC = 'PUBLIC',
    INVESTORS_ONLY = 'INVESTORS_ONLY',
    TEAM_ONLY = 'TEAM_ONLY',
}

@Entity('startup_posts')
export class StartupPost {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'startup_id' })
    @Index()
    startupId: string;

    @Column({ name: 'author_id' })
    authorId: string; // User ID of the posterior

    @Column('text')
    content: string;

    @Column('simple-array', { nullable: true })
    mediaUrls: string[];

    @Column({
        type: 'enum',
        enum: PostType,
        default: PostType.UPDATE,
    })
    type: PostType;

    @Column({
        type: 'enum',
        enum: PostVisibility,
        default: PostVisibility.PUBLIC,
    })
    @Index()
    visibility: PostVisibility;

    @Column({ default: 0 })
    likesCount: number;

    @Column({ default: 0 })
    commentsCount: number;

    @Column({ default: false })
    isPinned: boolean;

    @CreateDateColumn({ name: 'created_at' })
    @Index()
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Startup, (startup) => startup.posts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'startup_id' })
    startup: Startup;
}
