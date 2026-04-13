'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CopyIcon, ZapIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface SenderViewProps {
    connectionCode: string;
    isConnecting: boolean;
    onStart: () => void;
    onCopy: () => void;
    onCancel: () => void;
}

export const SenderView = ({
    connectionCode,
    isConnecting,
    onStart,
    onCopy,
    onCancel,
}: SenderViewProps) => {
    const { t } = useTranslation();
    if (!connectionCode && !isConnecting) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8"
            >
                <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                    <div className="relative z-10 w-full h-full bg-primary/10 rounded-full flex items-center justify-center">
                        <ZapIcon className="w-10 h-10 text-primary" />
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold font-heading">
                            {t('sender.ready_title')}
                        </h3>
                        <p className="text-muted-foreground text-sm max-w-[240px] mx-auto leading-relaxed">
                            {t('sender.ready_desc')}
                        </p>
                    </div>
                    <Button
                        className="w-full h-14 sm:h-18 text-lg font-bold rounded-2xl glow-primary shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
            <div className="text-center space-y-4">
                <Label className="text-xs text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">
                    {t('sender.active_code')}
                </Label>
                <div className="flex-center gap-3">
                    {connectionCode ? (
                        <div className="w-full flex-center rounded-xl sm:rounded-2xl h-16 sm:h-20 md:h-24 bg-muted backdrop-blur-md border border-white/10">
                            <div className="w-full flex-center gap-3 sm:gap-4 md:gap-6">
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
                                            'font-bold aspect-square',
                                            'flex-center',
                                        )}
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-14 flex-center gap-3 text-primary/70 font-medium">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="animate-pulse">
                                {t('sender.building')}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center gap-6">
                {connectionCode && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Button
                            variant="secondary"
                            className="rounded-2xl px-8 h-12 font-bold shadow-lg border border-white/5 hover:bg-white/10"
                            onClick={onCopy}
                        >
                            <CopyIcon className="w-4 h-4 mr-3" />
                            {t('sender.copy_btn')}
                        </Button>
                    </motion.div>
                )}

                <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 max-w-[280px] text-center">
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                        {t('sender.waiting')}
                    </p>
                </div>

                <Button
                    variant="destructive"
                    level="secondary"
                    size="sm"
                    onClick={onCancel}
                >
                    {t('sender.terminate')}
                </Button>
            </div>
        </motion.div>
    );
};
