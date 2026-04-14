import DefaultCardSkeleton from '@/components/skeletons/DefaultCardSkeleton';

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <DefaultCardSkeleton />
        </div>
    );
}
