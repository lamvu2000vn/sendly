'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, AlertTriangle, Home } from 'lucide-react';

import { useNetwork } from '@/hooks/useNetwork';

interface ErrorViewProps {
    reason: string | null;
    onRetry: () => void;
    onBackToHome: () => void;
}

export const ErrorView = ({
    reason,
    onRetry,
    onBackToHome,
}: ErrorViewProps) => {
    const { t } = useTranslation();
    const isOnline = useNetwork();
    const isReasonOffline = reason === 'offline';
    const isOffline = isReasonOffline || !isOnline;

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
                <h2 className="text-foreground text-2xl font-bold tracking-tight">
                    {t('error.title')}
                </h2>
                <p className="text-muted-foreground mx-auto max-w-sm">
                    {isOffline ? t('error.offline') : t('error.network_issue')}
                </p>
            </div>

            <div className="bg-muted/50 w-full max-w-md space-y-4 rounded-2xl p-6 text-left ring-1 ring-white/10">
                <div className="text-foreground flex items-center gap-2 text-sm font-semibold">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    {t('error.troubleshoot_title')}
                </div>
                <ul className="text-muted-foreground space-y-3 text-sm">
                    {[1, 2, 3].map((num) => (
                        <li key={num} className="flex gap-3">
                            <span className="bg-background text-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ring-1 ring-white/10">
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
                    disabled={!isOnline}
                    className="group h-12 min-w-[140px] gap-2 rounded-xl px-8 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw
                        className={`h-4 w-4 transition-transform ${isOnline ? 'group-hover:rotate-180' : ''}`}
                    />
                    {!isOnline ? t('error.no_connection') : t('error.retry')}
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
