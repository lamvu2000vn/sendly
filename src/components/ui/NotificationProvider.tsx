'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/store/useNotificationStore';
import { NotificationItem } from './NotificationItem';

export const NotificationProvider: React.FC = () => {
    const notifications = useNotificationStore((state) => state.notifications);

    return (
        <div
            className="pointer-events-none fixed top-6 right-0 left-0 z-100 flex flex-col items-center px-4"
            aria-live="polite"
        >
            <div className="relative h-0 w-full max-w-sm">
                <AnimatePresence mode="popLayout">
                    {notifications.map((notification, index) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            index={index}
                            total={notifications.length}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
