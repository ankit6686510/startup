import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface IconWrapperProps {
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const sizeClasses = {
    sm: 'p-1.5 rounded-md',
    md: 'p-2.5 rounded-lg',
    lg: 'p-3 rounded-xl',
};

const variantClasses = {
    default: 'bg-muted text-foreground',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
};

export function IconWrapper({
    children,
    size = 'md',
    variant = 'default',
    className
}: IconWrapperProps) {
    return (
        <div className={cn(
            'flex items-center justify-center transition-colors',
            sizeClasses[size],
            variantClasses[variant],
            className
        )}>
            {children}
        </div>
    );
}
