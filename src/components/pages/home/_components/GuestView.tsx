'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { ConnectionLoading } from './ConnectionLoading';
import { audioService } from '@/utils/audio';
import { useEffect } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';

const CODE_LENGTH = 8;

interface GuestViewProps {
    inputCode: string;
    isConnecting: boolean;
    onInputChange: (value: string) => void;
    onJoin: () => void;
    onBack: () => void;
}

export const GuestView = ({
    inputCode,
    isConnecting,
    onInputChange,
    onJoin,
    onBack,
}: GuestViewProps) => {
    const { t } = useTranslation();
    const { isSignalFound } = useWebRTC();
    const isCodeValid = inputCode.length === CODE_LENGTH;

    // Play subtle pop sound when code becomes valid
    useEffect(() => {
        if (isCodeValid) {
            audioService.playPop();
        }
    }, [isCodeValid]);

    return (
        <AnimatePresence mode="wait">
            {isConnecting ? (
                <motion.div
                    key="connecting"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6"
                >
                    <ConnectionLoading
                        variant={isSignalFound ? 'connecting' : 'searching'}
                        title={
                            isSignalFound
                                ? t('receiver.connecting_title')
                                : t('receiver.searching_title')
                        }
                        subtitle={
                            isSignalFound
                                ? t('receiver.connecting_subtitle')
                                : t('receiver.searching_subtitle')
                        }
                    />
                    <div className="flex justify-center">
                        <Button
                            variant="destructive"
                            level="secondary"
                            size="sm"
                            onClick={onBack}
                            className="opacity-70 transition-opacity hover:opacity-100"
                        >
                            {t('receiver.abort')}
                        </Button>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="input"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative space-y-12"
                >
                    <div className="space-y-8">
                        <div className="space-y-4 text-center">
                            <div className="flex items-center justify-center gap-3">
                                <Label
                                    htmlFor="code-input"
                                    className="text-muted-foreground text-xs font-black tracking-[0.3em] uppercase opacity-60"
                                >
                                    {t('receiver.target_label')}
                                </Label>
                                <AnimatePresence>
                                    {isCodeValid && (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                scale: 0.8,
                                                x: -10,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                                x: 0,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                scale: 0.8,
                                                x: -10,
                                            }}
                                        >
                                            <Badge className="glow-primary h-6 gap-1.5 rounded-full px-3 text-[10px] font-black tracking-widest uppercase transition-all duration-500 sm:h-7 sm:px-4 sm:text-[11px]">
                                                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                                {t('receiver.valid_code')}
                                            </Badge>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="group relative">
                                <Input
                                    id="code-input"
                                    placeholder={t('receiver.placeholder')}
                                    value={inputCode}
                                    onChange={(e) =>
                                        onInputChange(
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    maxLength={CODE_LENGTH}
                                    className={cn(
                                        'bg-muted focus-visible:ring-primary/50 focus-visible:border-primary/50 border-border relative h-16 rounded-xl text-center text-lg font-bold tracking-[0.5em] uppercase backdrop-blur-md transition-all duration-500 placeholder:text-sm placeholder:font-black placeholder:tracking-widest sm:h-20 sm:rounded-2xl sm:text-2xl sm:tracking-[0.7em] sm:placeholder:text-lg md:h-24 md:text-3xl md:placeholder:text-xl',
                                        isCodeValid &&
                                            'border-primary/50 ring-primary/20 bg-primary/5 ring-4',
                                    )}
                                    disabled={isConnecting}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Button
                                className={cn(
                                    'h-14 w-full rounded-xl text-base font-bold shadow-xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] sm:h-16 sm:rounded-2xl sm:text-lg md:h-18',
                                    isCodeValid
                                        ? 'glow-primary shadow-primary/20'
                                        : 'bg-muted text-muted-foreground opacity-50',
                                )}
                                disabled={!isCodeValid || isConnecting}
                                onClick={onJoin}
                            >
                                <span className="flex items-center justify-center gap-2 sm:gap-3">
                                    {t('receiver.establish_btn')}
                                    <ArrowRight
                                        className={cn(
                                            'h-5 w-5 transition-transform sm:h-6 sm:w-6',
                                            isCodeValid && 'animate-pulse',
                                        )}
                                    />
                                </span>
                            </Button>

                            <p className="text-muted-foreground text-center text-[10px] font-bold tracking-widest uppercase opacity-50">
                                {t('receiver.hint')}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
