'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ZapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface ModeSelectionProps {
    onHost: () => void;
    onGuest: () => void;
}

export function ModeSelection({ onHost, onGuest }: ModeSelectionProps) {
    const { t } = useTranslation();

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.15,
                    },
                },
            }}
            initial="hidden"
            animate="visible"
            className="text-center space-y-8 py-4"
        >
            <motion.div
                variants={{
                    hidden: {
                        scale: 0.8,
                        opacity: 0,
                    },
                    visible: {
                        scale: 1,
                        opacity: 1,
                    },
                }}
                className="relative w-20 h-20 mx-auto"
            >
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                <div className="relative z-10 w-full h-full bg-primary/10 rounded-full flex items-center justify-center">
                    <ZapIcon className="w-10 h-10 text-primary" />
                </div>
            </motion.div>

            <motion.div
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.1,
                        },
                    },
                }}
                className="space-y-6"
            >
                <motion.div
                    variants={{
                        hidden: {
                            y: 10,
                            opacity: 0,
                        },
                        visible: {
                            y: 0,
                            opacity: 1,
                        },
                    }}
                    className="space-y-2"
                >
                    <h3 className="text-xl font-bold font-heading">
                        {t('sender.ready_title')}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-[240px] mx-auto leading-relaxed">
                        {t('sender.ready_desc')}
                    </p>
                </motion.div>

                <motion.div
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.1,
                            },
                        },
                    }}
                    className="space-y-6"
                >
                    <motion.div
                        variants={{
                            hidden: {
                                y: 10,
                                opacity: 0,
                            },
                            visible: {
                                y: 0,
                                opacity: 1,
                            },
                        }}
                    >
                        <Button
                            className="w-full h-16 sm:h-20 text-lg sm:text-xl font-bold rounded-2xl glow-primary shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            onClick={onHost}
                        >
                            {t('sender.generate_btn')}
                        </Button>
                    </motion.div>

                    <motion.div
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1 },
                        }}
                        className="relative"
                    >
                        <div className="absolute inset-0 flex items-center">
                            <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background/40 backdrop-blur-xl px-5 py-1.5 rounded-full border border-white/20 dark:border-white/5 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                                {t('common.or') || 'or'}
                            </span>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={{
                            hidden: {
                                y: 10,
                                opacity: 0,
                            },
                            visible: {
                                y: 0,
                                opacity: 1,
                            },
                        }}
                    >
                        <Button
                            variant="secondary"
                            className="w-full h-12 sm:h-14 text-base font-bold rounded-2xl shadow-lg border border-white/5 hover:bg-white/10 transition-all"
                            onClick={onGuest}
                        >
                            {t('sender.enter_code_btn')}
                        </Button>
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
