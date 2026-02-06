import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoreVerticalIcon, UserPlusIcon, ShieldIcon } from 'lucide-react';

interface Member {
    id: string;
    name: string;
    email: string;
    role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
    avatar: string;
    status: 'ACTIVE' | 'INVITED';
}

export function TeamManager({ startupId }: { startupId: string }) {
    const [members, setMembers] = useState<Member[]>([
        {
            id: '1',
            name: 'Sarah Chen',
            email: 'sarah@neuralflow.ai',
            role: 'OWNER',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b78b1aec?w=50&h=50&fit=crop',
            status: 'ACTIVE'
        },
        {
            id: '2',
            name: 'Marcus Rodriguez',
            email: 'marcus@neuralflow.ai',
            role: 'ADMIN',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
            status: 'ACTIVE'
        },
        {
            id: '3',
            name: 'Alex Johnson',
            email: 'alex@neuralflow.ai',
            role: 'EDITOR',
            avatar: '', // Fallback
            status: 'INVITED'
        }
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Team Management</h3>
                    <p className="text-gray-500">Manage access and roles for your organization.</p>
                </div>
                <Button>
                    <UserPlusIcon className="h-4 w-4 mr-2" />
                    Invite Member
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {members.map((member) => (
                        <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="flex items-center gap-4">
                                {member.avatar ? (
                                    <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                        {member.email[0].toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        {member.name || member.email}
                                        {member.status === 'INVITED' && (
                                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pending</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500">{member.email}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700">
                                    <ShieldIcon className="h-3 w-3 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{member.role}</span>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVerticalIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
