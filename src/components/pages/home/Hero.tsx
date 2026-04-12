'use client';

import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Hero = () => {
    const { t } = useTranslation();
    return (
        <div className="text-center space-y-6 flex flex-col items-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20"
            >
                <div className="absolute inset-0 bg-primary blur-2xl opacity-20 animate-pulse" />
                <div className="relative z-10 flex items-center justify-center w-full h-full rounded-2xl sm:rounded-3xl bg-linear-to-br from-primary to-accent shadow-2xl shadow-primary/30">
                    <Share2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
            </motion.div>

            <div className="space-y-2">
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter text-foreground font-heading"
                >
                    <span className="text-gradient">Sendly</span>
                </motion.h1>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg sm:text-xl font-medium max-w-sm mx-auto leading-relaxed"
                >
                    {t('hero.tagline')}
                    <span className="block text-sm font-normal opacity-70 mt-1 uppercase tracking-widest">
                        {t('hero.p2p')}
                    </span>
                </motion.p>
            </div>
        </div>
    );
};
