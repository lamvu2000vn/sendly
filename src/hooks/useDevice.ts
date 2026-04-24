'use client';

import { useState, useEffect } from 'react';

/**
 * A lightweight alternative to react-device-detect.
 * Uses window.matchMedia and navigator.userAgent for reliable detection
 * without adding heavy dependencies.
 */
export function useDevice() {
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);

    useEffect(() => {
        const updateDevice = () => {
            const ua = navigator.userAgent;
            
            // Detection via MatchMedia (Reliable for responsive layout)
            const mobileMatch = window.matchMedia('(max-width: 767px)').matches;
            const tabletMatch = window.matchMedia('(min-width: 768px) and (max-width: 1024px)').matches;
            const desktopMatch = window.matchMedia('(min-width: 1025px)').matches;

            // Detection via UserAgent (Specific for OS/Features)
            const iosMatch = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
            const androidMatch = /Android/i.test(ua);

            setIsMobile(mobileMatch);
            setIsTablet(tabletMatch);
            setIsDesktop(desktopMatch);
            setIsIOS(iosMatch);
            setIsAndroid(androidMatch);
        };

        updateDevice();

        // Listen for screen size changes
        const mobileMql = window.matchMedia('(max-width: 767px)');
        const tabletMql = window.matchMedia('(min-width: 768px) and (max-width: 1024px)');
        
        mobileMql.addEventListener('change', updateDevice);
        tabletMql.addEventListener('change', updateDevice);

        return () => {
            mobileMql.removeEventListener('change', updateDevice);
            tabletMql.removeEventListener('change', updateDevice);
        };
    }, []);

    return {
        isMobile,
        isTablet,
        isDesktop,
        isIOS,
        isAndroid,
        isTouchDevice: isMobile || isTablet,
    };
}
