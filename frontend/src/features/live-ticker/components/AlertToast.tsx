'use client';

import { toast } from 'react-hot-toast';
import { TrendingUpIcon, DollarSignIcon, ZapIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AlertType = 'FUNDING' | 'NEW_STARTUP' | 'TRENDING';

interface AlertToastProps {
    t: any; // toast instance
    type: AlertType;
    title: string;
    message: string;
}

const icons = {
    FUNDING: <DollarSignIcon className="h-5 w-5 text-green-600" />,
    NEW_STARTUP: <ZapIcon className="h-5 w-5 text-blue-600" />,
    TRENDING: <TrendingUpIcon className="h-5 w-5 text-purple-600" />,
};

const styles = {
    FUNDING: 'bg-green-50 border-green-200',
    NEW_STARTUP: 'bg-blue-50 border-blue-200',
    TRENDING: 'bg-purple-50 border-purple-200',
};

export function AlertToast({ t, type, title, message }: AlertToastProps) {
    return (
        <div
            className={cn(
                'max-w-md w-full shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 transition-all duration-300',
                t.visible ? 'animate-enter' : 'animate-leave',
                styles[type],
                'bg-white/90 backdrop-blur-sm border'
            )}
        >
            <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                            {icons[type]}
                        </div>
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">{title}</p>
                        <p className="mt-1 text-sm text-gray-500">{message}</p>
                    </div>
                </div>
            </div>
            <div className="flex border-l border-gray-200/50">
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                    <XIcon className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
