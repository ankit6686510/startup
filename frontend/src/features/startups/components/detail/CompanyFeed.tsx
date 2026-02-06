import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquareIcon, ThumbsUpIcon, PinIcon, MoreHorizontalIcon } from 'lucide-react';

interface Post {
    id: string;
    author: {
        name: string;
        avatar: string;
        role: string;
    };
    content: string;
    timestamp: string;
    likes: number;
    comments: number;
    isPinned?: boolean;
    type: 'UPDATE' | 'MILESTONE' | 'ARTICLE';
}

export function CompanyFeed({ startupId }: { startupId: string }) {
    const [posts, setPosts] = useState<Post[]>([
        {
            id: '1',
            author: {
                name: 'Sarah Chen',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b78b1aec?w=150&h=150&fit=crop&crop=face',
                role: 'CEO'
            },
            content: 'We are thrilled to announce that we have just closed our Series A funding round! This is a huge milestone for NeuralFlow AI and we are excited for what is to come.',
            timestamp: '2 hours ago',
            likes: 45,
            comments: 12,
            isPinned: true,
            type: 'MILESTONE'
        },
        {
            id: '2',
            author: {
                name: 'Marcus Rodriguez',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                role: 'CTO'
            },
            content: 'Just deployed our new transformer model which improves inference speed by 40%. Check out our engineering blog for more details!',
            timestamp: '1 day ago',
            likes: 32,
            comments: 5,
            type: 'UPDATE'
        }
    ]);

    return (
        <div className="space-y-6">
            {/* Post Creator (Only visible to team members in real app) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <textarea
                    placeholder="Share an update..."
                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-lg p-4 focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                />
                <div className="flex justify-between items-center mt-4">
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm">Image</Button>
                        <Button variant="ghost" size="sm">Article</Button>
                    </div>
                    <Button>Post Update</Button>
                </div>
            </div>

            {/* Feed */}
            <div className="space-y-4">
                {posts.map((post) => (
                    <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        {post.author.name}
                                        <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                            {post.author.role}
                                        </span>
                                    </h4>
                                    <p className="text-sm text-gray-500">{post.timestamp}</p>
                                </div>
                            </div>
                            {post.isPinned && <PinIcon className="h-4 w-4 text-orange-500 rotate-45" />}
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                            {post.content}
                        </p>

                        <div className="flex items-center gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                                <ThumbsUpIcon className="h-4 w-4" />
                                <span>{post.likes}</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                                <MessageSquareIcon className="h-4 w-4" />
                                <span>{post.comments}</span>
                            </button>
                            <button className="ml-auto text-gray-400 hover:text-gray-600">
                                <MoreHorizontalIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
