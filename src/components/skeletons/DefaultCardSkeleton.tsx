import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

type DefaultCardSkeletonProps = {
    className?: string;
    spinnerClassName?: string;
};

const DefaultCardSkeleton = forwardRef<
    HTMLDivElement,
    DefaultCardSkeletonProps
>(
    (
        { className = '', spinnerClassName = '' }: DefaultCardSkeletonProps,
        ref,
    ) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'h-64 flex items-center justify-center',
                    className,
                )}
            >
                <div
                    className={cn(
                        'w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin',
                        spinnerClassName,
                    )}
                />
            </div>
        );
    },
);

DefaultCardSkeleton.displayName = 'DefaultCardSkeleton';

export default DefaultCardSkeleton;
