'use client';

import dynamic from 'next/dynamic';
import DefaultCardSkeleton from '@/components/skeletons/DefaultCardSkeleton';

const HomePageComponent = dynamic(() => import('@/components/pages/home'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center min-h-screen">
            <DefaultCardSkeleton />
        </div>
    ),
});

export default function Home() {
    return <HomePageComponent />;
}
