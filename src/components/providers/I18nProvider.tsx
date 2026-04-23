'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n/config';

export default function I18nProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { i18n } = useTranslation();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            document.documentElement.lang = i18n.language || 'en';
        }
    }, [i18n.language, mounted]);

    // Prevent hydration mismatch by not rendering until client-side mounted
    if (!mounted) {
        return null;
    }

    return <>{children}</>;
}
