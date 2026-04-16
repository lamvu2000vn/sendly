'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ZapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import GenerateButton from './GenerateButton';

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
            className="space-y-8 py-4 text-center"
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
                className="relative mx-auto h-20 w-20"
            >
                <div className="bg-primary/20 absolute inset-0 animate-ping rounded-full" />
                <div className="bg-primary/10 relative z-10 flex h-full w-full items-center justify-center rounded-full">
                    <ZapIcon className="text-primary h-10 w-10" />
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
                    <h3 className="font-heading text-xl font-bold">
                        {t('sender.ready_title')}
                    </h3>
                    <p className="text-muted-foreground mx-auto max-w-[240px] text-sm leading-relaxed">
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
                        <GenerateButton
                            onClick={onHost}
                        />
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
                            <span className="bg-background/40 text-muted-foreground border-border dark:border-border rounded-full border px-5 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase shadow-sm backdrop-blur-xl">
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
                            className="border-border h-12 w-full rounded-2xl border text-base font-bold shadow-lg transition-all duration-500 hover:bg-white/10 sm:h-14"
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
