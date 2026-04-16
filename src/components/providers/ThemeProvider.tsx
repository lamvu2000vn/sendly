'use client';

import React, { useLayoutEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export default function ThemeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { theme } = useAppStore();

    // useLayoutEffect runs synchronously after DOM mutations but BEFORE the browser paints.
    // This ensures the .dark class is applied immediately when theme changes,
    // eliminating the render-cycle delay that causes text color to lag.
    useLayoutEffect(() => {
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
