'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

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
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative space-y-12"
        >
            <div className="space-y-8">
                <div className="space-y-4 text-center">
                    <Label
                        htmlFor="code-input"
                        className="text-muted-foreground text-xs font-black tracking-[0.3em] uppercase opacity-60"
                    >
                        {t('receiver.target_label')}
                    </Label>
                    <div className="group relative">
                        <Input
                            id="code-input"
                            placeholder={t('receiver.placeholder')}
                            value={inputCode}
                            onChange={(e) =>
                                onInputChange(e.target.value.toUpperCase())
                            }
                            maxLength={CODE_LENGTH}
                            className="bg-muted focus-visible:ring-primary/50 focus-visible:border-primary/50 relative h-16 rounded-xl border-white/10 text-center text-lg font-bold tracking-[0.5em] uppercase backdrop-blur-md transition-all duration-500 placeholder:text-sm placeholder:font-black placeholder:tracking-widest sm:h-20 sm:rounded-2xl sm:text-2xl sm:tracking-[0.7em] sm:placeholder:text-lg md:h-24 md:text-3xl md:placeholder:text-xl"
                            disabled={isConnecting}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <Button
                        className="glow-primary shadow-primary/20 h-14 w-full rounded-xl text-base font-bold shadow-xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] sm:h-16 sm:rounded-2xl sm:text-lg md:h-18"
                        disabled={inputCode.length !== 8 || isConnecting}
                        onClick={onJoin}
                    >
                        <span className="flex items-center justify-center gap-2 sm:gap-3">
                            {isConnecting ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin sm:h-6 sm:w-6" />
                                    {t('receiver.opening')}
                                </>
                            ) : (
                                <>
                                    {t('receiver.establish_btn')}
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1 sm:h-6 sm:w-6" />
                                </>
                            )}
                        </span>
                    </Button>

                    <p className="text-muted-foreground text-center text-[10px] font-bold tracking-widest uppercase opacity-50">
                        {t('receiver.hint')}
                    </p>
                </div>
            </div>

            {isConnecting && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center"
                >
                    <Button
                        variant="destructive"
                        level="secondary"
                        size="sm"
                        onClick={onBack}
                    >
                        {t('receiver.abort')}
                    </Button>
                </motion.div>
            )}
        </motion.div>
    );
};
