'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, AlertTriangle, Home } from 'lucide-react';

interface ErrorViewProps {
    reason: string | null;
    onRetry: () => void;
    onBackToHome: () => void;
}

export const ErrorView = ({ reason, onRetry, onBackToHome }: ErrorViewProps) => {
    const { t } = useTranslation();
    const isOffline = reason === 'offline' || (typeof window !== 'undefined' && !window.navigator.onLine);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center space-y-8 py-4 text-center"
        >
            <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-full bg-red-500/20 blur-xl" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500 ring-1 ring-red-500/20">
                    <AlertCircle className="h-10 w-10" />
                </div>
            </div>

            <div className="space-y-3">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {t('error.title')}
                </h2>
                <p className="mx-auto max-w-sm text-muted-foreground">
                    {isOffline ? t('error.offline') : t('error.network_issue')}
                </p>
            </div>

            <div className="w-full max-w-md space-y-4 rounded-2xl bg-muted/50 p-6 text-left ring-1 ring-white/10">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    {t('error.troubleshoot_title')}
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                    {[1, 2, 3].map((num) => (
                        <li key={num} className="flex gap-3">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-background text-[10px] font-bold text-foreground ring-1 ring-white/10">
                                {num}
                            </span>
                            <span>{t(`error.troubleshoot_${num}` as any)}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                    onClick={onRetry}
                    className="group h-12 gap-2 rounded-xl px-8 transition-all active:scale-95"
                >
                    <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180" />
                    {t('error.retry')}
                </Button>
                <Button
                    variant="ghost"
                    onClick={onBackToHome}
                    className="h-12 gap-2 rounded-xl px-8 transition-all hover:bg-white/5 active:scale-95"
                >
                    <Home className="h-4 w-4" />
                    {t('error.back_to_home')}
                </Button>
            </div>
        </motion.div>
    );
};
