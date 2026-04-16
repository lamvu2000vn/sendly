'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    AlertCircle,
    AlertTriangle,
    Home,
    ShieldAlert,
    WifiOff,
    SearchX,
} from 'lucide-react';

import { useNetwork } from '@/hooks/useNetwork';

interface ErrorViewProps {
    reason: string | null;
    onBackToHome: () => void;
}

export const ErrorView = ({ reason, onBackToHome }: ErrorViewProps) => {
    const { t } = useTranslation();
    const isOnline = useNetwork();
    const isReasonOffline = reason === 'offline';
    const isOffline = isReasonOffline || !isOnline;
    const isRestricted = reason === 'isRestricted' || reason === 'network_restricted';
    const isInvalidCode = reason === 'invalid_code';

    const getErrorContent = () => {
        if (isInvalidCode) return t('error.invalid_code');
        if (isRestricted) return t('error.network_restricted');
        if (isOffline) return t('error.offline');
        return t('error.network_issue');
    };

    const getErrorIcon = () => {
        if (isInvalidCode) return <SearchX className="h-10 w-10" />;
        if (isRestricted) return <ShieldAlert className="h-10 w-10" />;
        if (isOffline) return <WifiOff className="h-10 w-10" />;
        return <AlertCircle className="h-10 w-10" />;
    };

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
                    {getErrorIcon()}
                </div>
            </div>

            <div className="space-y-3">
                <h2 className="text-foreground text-2xl font-bold tracking-tight">
                    {t('error.title')}
                </h2>
                <p className="text-muted-foreground mx-auto max-w-sm">
                    {getErrorContent()}
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
                    variant="ghost"
                    onClick={onBackToHome}
                    className="h-12 gap-2 rounded-xl border-none px-8 hover:shadow-xl active:scale-95"
                >
                    <Home className="h-4 w-4" />
                    {t('error.back_to_home')}
                </Button>
            </div>
        </motion.div>
    );
};
