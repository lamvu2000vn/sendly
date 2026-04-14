import DefaultCardSkeleton from '@/components/skeletons/DefaultCardSkeleton';

export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <DefaultCardSkeleton />
        </div>
    );
}
