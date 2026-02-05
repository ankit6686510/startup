import { cn } from '@/lib/utils';

export interface MetricValueProps {
    value: string | number;
    label?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    align?: 'left' | 'center' | 'right';
}

const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
};

export function MetricValue({
    value,
    label,
    size = 'lg',
    align = 'left',
    className
}: MetricValueProps) {
    return (
        <div className={cn('flex flex-col', {
            'items-start': align === 'left',
            'items-center': align === 'center',
            'items-end': align === 'right',
        }, className)}>
            <span className={cn(
                'font-bold text-foreground tracking-tight leading-none',
                sizeClasses[size]
            )}>
                {value}
            </span>
            {label && (
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">
                    {label}
                </span>
            )}
        </div>
    );
}
