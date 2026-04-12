'use client';

import { useEffect, useState } from 'react';
import '@/i18n/config';

export default function I18nProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by not rendering until client-side mounted
    if (!mounted) {
        return null;
    }

    return <>{children}</>;
}
