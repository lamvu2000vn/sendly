'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export default function ThemeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { theme } = useAppStore();

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = (theme: 'light' | 'dark' | 'system') => {
            root.classList.remove('light', 'dark');

            if (theme === 'system') {
                const systemTheme = window.matchMedia(
                    '(prefers-color-scheme: dark)',
                ).matches
                    ? 'dark'
                    : 'light';
                root.classList.add(systemTheme);
                return;
            }

            root.classList.add(theme);
        };

        applyTheme(theme);

        // Listen for system theme changes if theme is set to 'system'
        if (theme === 'system') {
            const mediaQuery = window.matchMedia(
                '(prefers-color-scheme: dark)',
            );
            const handleChange = () => applyTheme('system');
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    return <>{children}</>;
}
