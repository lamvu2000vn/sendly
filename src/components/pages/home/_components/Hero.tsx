'use client';

import { memo } from 'react';
import { m } from 'framer-motion';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export const Hero = memo(() => {
    const { t } = useTranslation();
    const reducedMotion = useReducedMotion();

    return (
        <div className="flex flex-col items-center space-y-6 text-center">
            <m.div
                initial={{
                    scale: 0.8,
                    opacity: 0,
                    rotate: reducedMotion ? 0 : -10,
                }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                whileHover={reducedMotion ? {} : { scale: 1.3, rotate: 10 }}
                className="relative flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20"
            >
                <div
                    className={`bg-primary absolute inset-0 opacity-30 blur-3xl ${!reducedMotion ? 'animate-pulse' : ''}`}
                    aria-hidden="true"
                />
                <Image
                    src="/assets/images/icon_256.svg"
                    alt="Sendly Logo"
                    width={64}
                    height={64}
                    className="drop-shadow-[0_0_8px_var(--secondary)]"
                    priority
                />
            </m.div>

            <div className="space-y-2">
                <m.h1
                    initial={{ y: reducedMotion ? 0 : 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-foreground font-heading text-5xl font-black tracking-tighter sm:text-6xl md:text-7xl"
                >
                    <span className="text-gradient inline-block px-2 pb-1">
                        Sendly
                    </span>
                </m.h1>
                <m.p
                    initial={{ y: reducedMotion ? 0 : 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mx-auto max-w-sm text-lg leading-relaxed font-medium sm:text-xl"
                >
                    {t('hero.tagline')}
                    <span className="mt-1 block text-sm font-normal tracking-widest uppercase opacity-70">
                        {t('hero.p2p')}
                    </span>
                </m.p>
            </div>
        </div>
    );
});

Hero.displayName = 'Hero';
