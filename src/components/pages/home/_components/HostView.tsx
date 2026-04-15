'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CopyIcon, ZapIcon, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

interface HostViewProps {
    connectionCode: string;
    isConnecting: boolean;
    isCodeExpired?: boolean;
    onStart: () => void;
    onCopy: () => void;
    onBack: () => void;
}

export const HostView = ({
    connectionCode,
    isConnecting,
    isCodeExpired,
    onStart,
    onCopy,
    onBack,
}: HostViewProps) => {
    const { t } = useTranslation();
    const { connectionCodeCreatedAt } = useAppStore();
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        if (!connectionCodeCreatedAt || isCodeExpired || !connectionCode)
            return;

        const updateTimer = () => {
            const elapsed = Date.now() - connectionCodeCreatedAt;
            const remaining = Math.max(0, Math.ceil((30000 - elapsed) / 1000));
            setTimeLeft(remaining);
        };

        const timer = setInterval(updateTimer, 1000);
        updateTimer();

        return () => clearInterval(timer);
    }, [connectionCodeCreatedAt, isCodeExpired, connectionCode]);

    if (!connectionCode && !isConnecting) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative space-y-8 text-center"
            >
                <div className="relative mx-auto h-20 w-20">
                    <div className="bg-primary/20 absolute inset-0 animate-ping rounded-full" />
                    <div className="bg-primary/10 relative z-10 flex h-full w-full items-center justify-center rounded-full">
                        <ZapIcon className="text-primary h-10 w-10" />
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h3 className="font-heading text-xl font-bold">
                            {t('sender.ready_title')}
                        </h3>
                        <p className="text-muted-foreground mx-auto max-w-[240px] text-sm leading-relaxed">
                            {t('sender.ready_desc')}
                        </p>
                    </div>
                    <Button
                        className="glow-primary shadow-primary/20 h-14 w-full rounded-2xl text-lg font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] sm:h-18"
                        onClick={onStart}
                    >
                        {t('sender.generate_btn')}
                    </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10"
        >
            <div className="space-y-4 text-center">
                <div className="flex items-center justify-center gap-4">
                    <Label className="text-muted-foreground text-xs font-black tracking-[0.3em] uppercase opacity-60">
                        {t('sender.active_code')}
                    </Label>
                    {!isCodeExpired && connectionCode && (
                        <div className="border-border flex items-center gap-1.5 rounded-full border bg-white/10 px-2.5 py-1">
                            <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
                            <span className="text-[10px] font-bold tabular-nums">
                                {timeLeft}s
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex-center group relative overflow-hidden rounded-xl sm:rounded-2xl">
                    <div
                        className={cn(
                            'flex-center bg-muted border-border h-16 w-full rounded-xl border backdrop-blur-md transition-all duration-500 sm:h-20 sm:rounded-2xl md:h-24',
                            isCodeExpired && 'blur-md grayscale',
                        )}
                    >
                        <div className="flex-center w-full gap-3 sm:gap-4 md:gap-6">
                            {connectionCode.split('').map((char, i) => (
                                <motion.span
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{
                                        delay: i * 0.05,
                                        type: 'spring',
                                    }}
                                    key={i}
                                    className={cn(
                                        'text-lg sm:text-2xl md:text-3xl',
                                        'aspect-square font-bold',
                                        'flex-center',
                                    )}
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence>
                        {isCodeExpired && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-1 sm:gap-3"
                            >
                                <p className="text-foreground text-sm font-bold drop-shadow-md">
                                    {t('sender.code_expired')}
                                </p>
                                <Button
                                    size="sm"
                                    onClick={onStart}
                                    className="bg-primary h-9 gap-2 rounded-xl px-5 text-xs font-bold shadow-xl ring-1 ring-white/20 transition-all duration-500 hover:scale-105 active:scale-95"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    {t('sender.regenerate_btn')}
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex flex-col items-center gap-6">
                {connectionCode && !isCodeExpired && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Button
                            variant="secondary"
                            className="border-border h-12 rounded-2xl border px-8 font-bold shadow-lg transition-all hover:scale-[1.02] hover:bg-white/10"
                            onClick={onCopy}
                        >
                            <CopyIcon className="mr-3 h-4 w-4" />
                            {t('sender.copy_btn')}
                        </Button>
                    </motion.div>
                )}

                <div className="border-border max-w-[280px] rounded-2xl border bg-white/5 px-6 py-3 text-center transition-all duration-500">
                    <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                        {isCodeExpired
                            ? t('sender.expired_desc')
                            : t('sender.waiting')}
                    </p>
                </div>

                <Button
                    variant="destructive"
                    level="secondary"
                    size="sm"
                    onClick={onBack}
                    className="opacity-70 transition-opacity duration-500 hover:opacity-100"
                >
                    {t('sender.terminate')}
                </Button>
            </div>
        </motion.div>
    );
};
