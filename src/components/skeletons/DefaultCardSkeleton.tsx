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
                    'flex h-64 items-center justify-center',
                    className,
                )}
            >
                <div
                    className={cn(
                        'border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent',
                        spinnerClassName,
                    )}
                />
            </div>
        );
    },
);

DefaultCardSkeleton.displayName = 'DefaultCardSkeleton';

export default DefaultCardSkeleton;
