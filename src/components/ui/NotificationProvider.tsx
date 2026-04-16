'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/store/useNotificationStore';
import { NotificationItem } from './NotificationItem';
import { cn } from '@/lib/utils';
import { isMobile } from 'react-device-detect';

export const NotificationProvider: React.FC = () => {
    const notifications = useNotificationStore((state) => state.notifications);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const position = 'top';

    return (
        <div
            className={cn(
                'pointer-events-none fixed right-0 left-0 z-100 flex flex-col items-center px-4 transition-all duration-500',
                'pt-[env(safe-area-inset-top)]',
                isMobile ? 'top-4' : 'top-8',
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
