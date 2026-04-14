'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import {
    CheckCircle2,
    AlertCircle,
    Info,
    AlertTriangle,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Notification,
    useNotificationStore,
} from '@/store/useNotificationStore';

interface NotificationItemProps {
    notification: Notification;
    index: number;
    total: number;
}

const icons = {
    success: <CheckCircle2 className="text-accent h-5 w-5" />,
    error: <AlertCircle className="text-destructive h-5 w-5" />,
    info: <Info className="text-primary h-5 w-5" />,
    warning: <AlertTriangle className="text-secondary h-5 w-5" />,
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    index,
    total,
}) => {
    const removeNotification = useNotificationStore(
        (state) => state.removeNotification,
    );
    const [isPaused, setIsPaused] = useState(false);
    const [isSwiped, setIsSwiped] = useState(false);
    const controls = useAnimation();

    // Timer logic
    const duration = notification.duration || 5000;
    const remainingRef = useRef(duration);
    const startRef = useRef(0);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isPaused) {
            startRef.current = Date.now();
            timerRef.current = setTimeout(() => {
                removeNotification(notification.id);
            }, remainingRef.current);

            // Start or Resume progress animation
            controls.start({
                width: '0%',
                transition: {
                    duration: remainingRef.current / 1000,
                    ease: 'linear',
                },
            });
        } else {
            // Pause logic
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                const elapsed = Date.now() - startRef.current;
                remainingRef.current = Math.max(
                    0,
                    remainingRef.current - elapsed,
                );
            }
            controls.stop();
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isPaused, notification.id, removeNotification, controls]);

    // 2026 Ethereal Stacking Logic
    const inverseIndex = index; // 0 is newest
    const scale = 1 - inverseIndex * 0.05;
    const opacity = 1 - inverseIndex * 0.2;
    const yOffset = inverseIndex * 12;
    const blur = inverseIndex * 2;

    return (
        <motion.div
            layout
            initial={{
                opacity: 0,
                y: -32,
                scale: 0.94,
                filter: 'blur(20px)',
                rotateX: -15,
            }}
            animate={{
                opacity,
                y: yOffset,
                scale,
                rotateX: 0,
                filter: `blur(${blur}px)`,
                zIndex: total - index,
            }}
            exit={
                isSwiped
                    ? {
                          x: 600,
                          opacity: 0,
                          scale: 0.9,
                          transition: { duration: 0.4, ease: 'easeIn' },
                      }
                    : {
                          opacity: 0,
                          scale: 0.9,
                          y: -20,
                          rotateX: 10,
                          filter: 'blur(12px)',
                          transition: {
                              duration: 0.6,
                              ease: [0.23, 1, 0.32, 1], // Custom gentle ease-out
                          },
                      }
            }
            transition={{
                type: 'spring',
                damping: 25,
                stiffness: 140,
                mass: 0.8,
            }}
            whileHover={{
                scale: scale + 0.015,
                filter: 'blur(0px)',
                opacity: 1,
                transition: { duration: 0.4, ease: 'easeOut' },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(_, info) => {
                if (info.offset.x > 100) {
                    setIsSwiped(true);
                    // Use a small delay to ensure the exit animation state is captured
                    setTimeout(() => removeNotification(notification.id), 0);
                }
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className={cn(
                'group pointer-events-auto absolute top-0 left-1/2 w-fit max-w-xl -translate-x-1/2 overflow-hidden',
                'glass cursor-grab rounded-3xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.3)] select-none active:cursor-grabbing',
                'flex items-center gap-4 border-white/20',
            )}
        >
            <div
                className={cn(
                    'shrink-0 rounded-2xl p-2',
                    notification.type === 'success' && 'bg-accent/10',
                    notification.type === 'error' && 'bg-destructive/10',
                    notification.type === 'info' && 'bg-primary/10',
                    notification.type === 'warning' && 'bg-secondary/10',
                )}
            >
                {notification.icon || icons[notification.type]}
            </div>
            <div className="w-max min-w-0 flex-1">
                <p className="text-foreground text-[15px] leading-snug font-semibold tracking-tight">
                    {notification.message}
                </p>
            </div>

            {/* Progress Bar Timer */}
            <motion.div
                initial={{ width: '100%' }}
                animate={controls}
                className={cn(
                    'absolute bottom-0 left-0 h-1 opacity-40',
                    notification.type === 'success' && 'bg-accent',
                    notification.type === 'error' && 'bg-destructive',
                    notification.type === 'info' && 'bg-primary',
                    notification.type === 'warning' && 'bg-secondary',
                )}
            />

            {/* 2026 Glow effect */}
            {index === 0 && (
                <motion.div
                    layoutId="glow"
                    className={cn(
                        'absolute inset-0 -z-10 rounded-3xl opacity-30 blur-2xl',
                        notification.type === 'success' && 'bg-accent/40',
                        notification.type === 'error' && 'bg-destructive/40',
                        notification.type === 'info' && 'bg-primary/40',
                        notification.type === 'warning' && 'bg-secondary/40',
                    )}
                />
            )}

            <button
                onClick={() => removeNotification(notification.id)}
                className="absolute top-2 right-2 rounded-full p-1.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/10"
            >
                <X className="text-muted-foreground h-3.5 w-3.5" />
            </button>
        </motion.div>
    );
};
