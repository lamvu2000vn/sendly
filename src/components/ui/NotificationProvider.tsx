'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { isMobile } from 'react-device-detect';
import { useNotificationStore } from '@/store/useNotificationStore';
import { NotificationItem } from './NotificationItem';
import { cn } from '@/lib/utils';

export const NotificationProvider: React.FC = () => {
    const notifications = useNotificationStore((state) => state.notifications);
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => {
            // Kết hợp cả User Agent (react-device-detect) và Screen Width để tối ưu đa nền tảng
            // Thêm check touch points để nhận diện tốt hơn trên iOS thực tế
            const hasTouch =
                typeof window !== 'undefined' &&
                (navigator.maxTouchPoints > 0 || 'ontouchstart' in window);
            setIsMobileDevice(isMobile || window.innerWidth < 768 || hasTouch);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!mounted) return null;

    const position = isMobileDevice ? 'bottom' : 'top';

    return (
        <div
            className={cn(
                'pointer-events-none fixed right-0 left-0 z-[100] flex flex-col items-center px-4 transition-all duration-500',
                position === 'top'
                    ? 'top-8 pt-[env(safe-area-inset-top)]'
                    : 'bottom-12 pb-[env(safe-area-inset-bottom)]',
            )}
            aria-live="polite"
        >
            <div
                className={cn(
                    'relative flex h-0 w-full max-w-sm flex-col',
                    position === 'top' ? 'justify-start' : 'justify-end',
                )}
            >
                <AnimatePresence mode="popLayout" initial={false}>
                    {notifications.map((notification, index) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            index={index}
                            total={notifications.length}
                            position={position}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
