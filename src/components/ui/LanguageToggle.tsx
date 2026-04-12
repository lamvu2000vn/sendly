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

export const LanguageToggle = () => {
    const { i18n, t } = useTranslation();

    const changeLanguage = (code: string) => {
        i18n.changeLanguage(code);
    };

    const currentLang =
        LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 z-50"
        >
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="group relative h-12 px-4 rounded-2xl glass border-white/10 shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 overflow-hidden"
                        title={t('language.toggle')}
                    >
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/20 shadow-sm shrink-0">
                            <Image
                                src={currentLang.flag}
                                alt={currentLang.label}
                                className="w-full h-full object-cover"
                                fill
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.span
                                key={i18n.language}
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -10, opacity: 0 }}
                                className="text-xs font-black tracking-widest"
                            >
                                {i18n.language.toUpperCase()}
                            </motion.span>
                        </AnimatePresence>
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-56 p-2 mb-3"
                    align="end"
                    side="top"
                    sideOffset={12}
                >
                    <div className="grid gap-1.5">
                        {LANGUAGES.map((lang) => {
                            const isActive = i18n.language === lang.code;
                            return (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={cn(
                                        'relative flex items-center gap-3 w-full p-2.5 rounded-2xl transition-all duration-300 group overflow-hidden',
                                        isActive
                                            ? 'bg-primary/10 text-primary shadow-sm'
                                            : 'hover:bg-white/5 text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-bg"
                                            className="absolute inset-0 bg-primary/5 rounded-2xl -z-10"
                                            transition={{
                                                type: 'spring',
                                                bounce: 0.2,
                                                duration: 0.6,
                                            }}
                                        />
                                    )}

                                    <div
                                        className={cn(
                                            'relative w-8 h-8 rounded-full overflow-hidden border border-white/10 shadow-md shrink-0 transition-all duration-500',
                                            isActive
                                                ? 'scale-110 ring-2 ring-primary/20 ring-offset-2 ring-offset-background/50'
                                                : 'group-hover:scale-105',
                                        )}
                                    >
                                        <Image
                                            src={lang.flag}
                                            alt={lang.label}
                                            className="w-full h-full object-cover"
                                            fill
                                        />
                                    </div>

                                    <div className="flex flex-col flex-1 text-left">
                                        <span className="text-sm font-semibold tracking-tight">
                                            {lang.label}
                                        </span>
                                        <span className="text-[10px] uppercase opacity-50 font-black tracking-widest">
                                            {lang.code}
                                        </span>
                                    </div>

                                    {isActive && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground"
                                        >
                                            <Check className="w-3 h-3 stroke-3" />
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
