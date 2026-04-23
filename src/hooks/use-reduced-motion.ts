'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user has requested reduced motion.
 * Useful for disabling animations for users with motion sensitivities.
 */
export function useReducedMotion() {
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        );
        setReducedMotion(mediaQuery.matches);

        const handleChange = (event: MediaQueryListEvent) => {
            setReducedMotion(event.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return reducedMotion;
}
