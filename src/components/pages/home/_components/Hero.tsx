'use client';

import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Hero = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center space-y-6 text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20"
            >
                <div className="bg-primary absolute inset-0 animate-pulse opacity-30 blur-3xl" />
                <div className="glass relative z-10 flex h-full w-full items-center justify-center rounded-2xl border-white/40 shadow-2xl dark:border-white/10">
                    <Share2 className="text-secondary h-8 w-8 drop-shadow-[0_0_8px_var(--secondary)] sm:h-10 sm:w-10" />
                </div>
            </motion.div>

            <div className="space-y-2">
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-foreground font-heading text-5xl font-black tracking-tighter sm:text-6xl md:text-7xl"
                >
                    <span className="text-gradient inline-block px-2 pb-1">
                        Sendly
                    </span>
                </motion.h1>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mx-auto max-w-sm text-lg leading-relaxed font-medium sm:text-xl"
                >
                    {t('hero.tagline')}
                    <span className="mt-1 block text-sm font-normal tracking-widest uppercase opacity-70">
                        {t('hero.p2p')}
                    </span>
                </motion.p>
            </div>
        </div>
    );
};
