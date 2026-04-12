'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

const CODE_LENGTH = 8;

interface ReceiverViewProps {
    inputCode: string;
    isConnecting: boolean;
    onInputChange: (value: string) => void;
    onJoin: () => void;
    onCancel: () => void;
}

export const ReceiverView = ({
    inputCode,
    isConnecting,
    onInputChange,
    onJoin,
    onCancel,
}: ReceiverViewProps) => {
    const { t } = useTranslation();
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
        >
            <div className="space-y-8">
                <div className="space-y-4 text-center">
                    <Label
                        htmlFor="code-input"
                        className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60"
                    >
                        {t('receiver.target_label')}
                    </Label>
                    <div className="relative group">
                        <Input
                            id="code-input"
                            placeholder={t('receiver.placeholder')}
                            value={inputCode}
                            onChange={(e) =>
                                onInputChange(e.target.value.toUpperCase())
                            }
                            maxLength={CODE_LENGTH}
                            className="relative h-16 sm:h-20 md:h-24 text-lg sm:text-2xl md:text-3xl font-bold text-center tracking-[0.2em] sm:tracking-[0.3em] rounded-xl sm:rounded-2xl border-white/10 bg-muted backdrop-blur-md uppercase placeholder:tracking-widest placeholder:text-sm sm:placeholder:text-lg md:placeholder:text-xl placeholder:font-black focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all"
                            disabled={isConnecting}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <Button
                        className="w-full h-14 sm:h-16 md:h-18 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl glow-primary shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        disabled={inputCode.length !== 8 || isConnecting}
                        onClick={onJoin}
                    >
                        <span className="flex items-center justify-center gap-2 sm:gap-3">
                            {isConnecting ? (
                                <>
                                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                                    {t('receiver.opening')}
                                </>
                            ) : (
                                <>
                                    {t('receiver.establish_btn')}
                                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </span>
                    </Button>

                    <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold opacity-50">
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
                        onClick={onCancel}
                    >
                        {t('receiver.abort')}
                    </Button>
                </motion.div>
            )}
        </motion.div>
    );
};
