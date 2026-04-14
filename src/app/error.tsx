'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center space-y-6 p-4 text-center">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter">
                    Something went wrong!
                </h2>
                <p className="text-muted-foreground max-w-md">
                    We encountered an unexpected error. Please try refreshing or
                    clearing your browser cache.
                </p>
            </div>
            <div className="flex gap-4">
                <Button onClick={() => reset()} variant="default">
                    Try again
                </Button>
                <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                >
                    Reload page
                </Button>
            </div>
        </div>
    );
}
