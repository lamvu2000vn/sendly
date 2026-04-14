'use client';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const LANGUAGES = [
    {
        code: 'en',
        label: 'English',
        flag: 'https://flagcdn.com/w80/us.png',
    },
    {
        code: 'vi',
        label: 'Tiếng Việt',
        flag: 'https://flagcdn.com/w80/vn.png',
    },
];

export const LanguageToggle = ({ className }: { className?: string }) => {
    const { i18n, t } = useTranslation();

    const changeLanguage = (code: string) => {
        i18n.changeLanguage(code);
    };

    const currentLang =
        LANGUAGES.find(
            (l) =>
                l.code === i18n.language ||
                l.code === i18n.language?.split('-')[0],
        ) || LANGUAGES[0];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('relative z-50', className)}
        >
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="group glass relative flex h-12 items-center gap-3 overflow-hidden rounded-2xl border-white/10 px-4 shadow-xl transition-all hover:scale-105 active:scale-95"
                        title={t('language.toggle')}
                    >
                        <div className="bg-primary/5 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />

                        <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border border-white/20 shadow-sm">
                            <Image
                                src={currentLang.flag}
                                alt={currentLang.label}
                                className="h-full w-full object-cover"
                                fill
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.span
                                key={currentLang.code}
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -10, opacity: 0 }}
                                className="text-xs font-black tracking-widest"
                            >
                                {currentLang.code.toUpperCase()}
                            </motion.span>
                        </AnimatePresence>
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="mb-3 w-56 p-2"
                    align="end"
                    side="top"
                    sideOffset={12}
                >
                    <div className="grid gap-1.5">
                        {LANGUAGES.map((lang) => {
                            const isActive = currentLang.code === lang.code;
                            return (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={cn(
                                        'group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl p-2.5 transition-all duration-200',
                                        isActive
                                            ? 'bg-primary/10 text-primary shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5',
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-bg"
                                            className="bg-primary/5 absolute inset-0 -z-10 rounded-2xl"
                                            transition={{
                                                type: 'spring',
                                                bounce: 0.2,
                                                duration: 0.4,
                                            }}
                                        />
                                    )}

                                    <div
                                        className={cn(
                                            'relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/10 shadow-md transition-all duration-200',
                                            isActive
                                                ? 'ring-primary/20 ring-offset-background/50 scale-110 ring-2 ring-offset-2'
                                                : 'group-hover:scale-105',
                                        )}
                                    >
                                        <Image
                                            src={lang.flag}
                                            alt={lang.label}
                                            className="h-full w-full object-cover"
                                            fill
                                        />
                                    </div>

                                    <div className="flex flex-1 flex-col text-left">
                                        <span className="text-sm font-semibold tracking-tight">
                                            {lang.label}
                                        </span>
                                        <span className="text-[10px] font-black tracking-widest uppercase opacity-50">
                                            {lang.code}
                                        </span>
                                    </div>

                                    {isActive && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full"
                                        >
                                            <Check className="h-3 w-3 stroke-3" />
                                        </motion.div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </PopoverContent>
            </Popover>
        </motion.div>
    );
};
