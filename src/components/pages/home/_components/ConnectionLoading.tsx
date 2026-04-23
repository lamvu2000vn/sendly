'use client';

import { motion } from 'framer-motion';
import { Radar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionLoadingProps {
    title?: string;
    subtitle?: string;
    className?: string;
    variant?: 'searching' | 'connecting';
}

export const ConnectionLoading = ({
    title,
    subtitle,
    className,
    variant = 'searching',
}: ConnectionLoadingProps) => {
    const isConnecting = variant === 'connecting';

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center space-y-8 py-10',
                className,
            )}
        >
            <div className="relative flex items-center justify-center">
                {/* Radar Rings */}
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={cn(
                            'absolute rounded-full border',
                            isConnecting
                                ? 'border-primary/50 bg-primary/5'
                                : 'border-primary/30',
                        )}
                        initial={
                            isConnecting
                                ? { width: 240, height: 240, opacity: 0 }
                                : { width: 80, height: 80, opacity: 0 }
                        }
                        animate={
                            isConnecting
                                ? {
                                      width: [240, 80],
                                      height: [240, 80],
                                      opacity: [0, 0.8, 0],
                                  }
                                : {
                                      width: [80, 240],
                                      height: [80, 240],
                                      opacity: [0, 0.5, 0],
                                  }
                        }
                        transition={{
                            duration: isConnecting ? 1.5 : 2,
                            repeat: Infinity,
                            delay: i * (isConnecting ? 0.4 : 0.6),
                            ease: isConnecting ? 'easeIn' : 'easeOut',
                        }}
                    />
                ))}

                {/* Central Icon */}
                <motion.div
                    className={cn(
                        'glow-primary border-primary/20 relative z-10 flex h-20 w-20 items-center justify-center rounded-full border backdrop-blur-md transition-colors duration-500',
                        isConnecting ? 'bg-primary/20' : 'bg-primary/10',
                    )}
                    animate={{
                        scale: isConnecting ? [1, 1.2, 1] : [1, 1.1, 1],
                    }}
                    transition={{
                        duration: isConnecting ? 1 : 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    <Radar
                        className={cn(
                            'text-primary h-10 w-10 transition-all duration-1000',
                            isConnecting ? 'animate-spin-fast' : 'animate-spin',
                        )}
                    />
                </motion.div>
            </div>

            <div className="space-y-3 text-center">
                {title && (
                    <motion.h3
                        key={title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xl font-bold tracking-tight"
                    >
                        {title}
                    </motion.h3>
                )}
                {subtitle && (
                    <motion.p
                        key={subtitle}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground mx-auto max-w-[280px] text-sm leading-relaxed"
                    >
                        {subtitle}
                    </motion.p>
                )}
            </div>
        </div>
    );
};
