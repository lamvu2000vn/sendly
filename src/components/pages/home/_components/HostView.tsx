'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CopyIcon, ZapIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface HostViewProps {
    connectionCode: string;
    isConnecting: boolean;
    onStart: () => void;
    onCopy: () => void;
    onBack: () => void;
}

export const HostView = ({
    connectionCode,
    isConnecting,
    onStart,
    onCopy,
    onBack,
}: HostViewProps) => {
    const { t } = useTranslation();
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
                <Label className="text-muted-foreground text-xs font-black tracking-[0.3em] uppercase opacity-60">
                    {t('sender.active_code')}
                </Label>
                <div className="flex-center gap-3">
                    {connectionCode ? (
                        <div className="flex-center bg-muted h-16 w-full rounded-xl border border-white/10 backdrop-blur-md sm:h-20 sm:rounded-2xl md:h-24">
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
                    ) : (
                        <div className="flex-center text-primary/70 h-14 gap-3 font-medium">
                            <Loader2 className="h-6 w-6 animate-spin" />
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
                            className="h-12 rounded-2xl border border-white/5 px-8 font-bold shadow-lg hover:bg-white/10"
                            onClick={onCopy}
                        >
                            <CopyIcon className="mr-3 h-4 w-4" />
                            {t('sender.copy_btn')}
                        </Button>
                    </motion.div>
                )}

                <div className="max-w-[280px] rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-center">
                    <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                        {t('sender.waiting')}
                    </p>
                </div>

                <Button
                    variant="destructive"
                    level="secondary"
                    size="sm"
                    onClick={onBack}
                >
                    {t('sender.terminate')}
                </Button>
            </div>
        </motion.div>
    );
};
