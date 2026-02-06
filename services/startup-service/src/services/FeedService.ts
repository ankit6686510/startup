import { AppDataSource } from '../config/database';
import { StartupPost, PostType, PostVisibility } from '../models/StartupPost';
import { logger } from '../utils/logger';

export class FeedService {
    private postRepository = AppDataSource.getRepository(StartupPost);


    async createPost(
        startupId: string,
        authorId: string,
        data: { content: string; type: PostType; visibility: PostVisibility; mediaUrls?: string[] }
    ): Promise<StartupPost> {
        const post = this.postRepository.create({
            startupId,
            authorId,
            ...data,
        });

        try {
            const savedPost = await this.postRepository.save(post);
            logger.info(`Created post ${savedPost.id} for startup ${startupId}`);
            return savedPost;
        } catch (error: any) {
            logger.error(`Failed to create post: ${error.message}`);
            throw error;
        }
    }

    async getStartupFeed(startupId: string, viewerRole?: string): Promise<StartupPost[]> {
        const query = this.postRepository.createQueryBuilder('post')
            .where('post.startupId = :startupId', { startupId })
            .orderBy('post.isPinned', 'DESC')
            .addOrderBy('post.createdAt', 'DESC');

        // Filter by visibility
        if (!viewerRole) {
            // Public user
            query.andWhere('post.visibility = :visibility', { visibility: PostVisibility.PUBLIC });
        } else {
            // Logic for internal team/investors can be expanded here
            // For now, if viewerRole is present, we show everything or filter slightly less
        }

        return query.getMany();
    }

    async deletePost(postId: string, userId: string): Promise<void> {
        const post = await this.postRepository.findOne({ where: { id: postId } });
        if (!post) throw new Error('Post not found');

        if (post.authorId !== userId) {
            // In real app, check if user is admin of startup
            // For now trusting the caller has checked permissions via CompanyService
        }

        await this.postRepository.remove(post);
        logger.info(`Deleted post ${postId}`);
    }
}
