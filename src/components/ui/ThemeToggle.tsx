'use client';

import { useAppStore } from '@/store/useAppStore';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface ThemeToggleProps {
    className?: string;
}

const THEMES = [
    { key: 'light', icon: Sun, label: 'Light' },
    { key: 'dark', icon: Moon, label: 'Dark' },
    { key: 'system', icon: Monitor, label: 'System' },
] as const;

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
    const { theme, setTheme } = useAppStore();

    const currentTheme = THEMES.find((t) => t.key === theme) || THEMES[0];

    return (
        <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('relative z-50', className)}
        >
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="group glass relative flex h-12 items-center gap-3 overflow-hidden rounded-2xl px-4 shadow-xl transition-all duration-500 active:scale-95"
                        aria-label="Switch Theme"
                    >
                        <div className="bg-primary/5 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />

                        <div className="border-border bg-background/50 relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border shadow-sm">
                            <AnimatePresence mode="wait">
                                <m.div
                                    key={theme}
                                    initial={{
                                        opacity: 0,
                                        scale: 0.5,
                                        rotate: -45,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        rotate: 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        scale: 0.5,
                                        rotate: 45,
                                    }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <currentTheme.icon className="text-primary h-3.5 w-3.5" />
                                </m.div>
                            </AnimatePresence>
                        </div>

                        <AnimatePresence mode="wait">
                            <m.span
                                key={theme}
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -10, opacity: 0 }}
                                className="text-muted-foreground group-hover:text-foreground text-xs font-black tracking-widest uppercase"
                            >
                                {theme}
                            </m.span>
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
                        {THEMES.map((t) => {
                            const isActive = theme === t.key;
                            return (
                                <button
                                    key={t.key}
                                    onClick={() => setTheme(t.key)}
                                    className={cn(
                                        'group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl p-2.5 transition-all duration-300 outline-none',
                                        isActive
                                            ? 'bg-primary/10 text-primary shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-border',
                                    )}
                                    aria-current={isActive ? 'true' : undefined}
                                >
                                    {isActive && (
                                        <m.div
                                            layoutId="active-theme-bg"
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
                                            'border-border bg-background/50 relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border shadow-md transition-all duration-300',
                                            isActive
                                                ? 'ring-primary/20 ring-offset-background/50 scale-110 ring-2 ring-offset-2'
                                                : 'group-hover:scale-105',
                                        )}
                                    >
                                        <t.icon className="h-4 w-4" />
                                    </div>

                                    <div className="flex flex-1 flex-col text-left">
                                        <span className="text-sm font-semibold tracking-tight">
                                            {t.label}
                                        </span>
                                        <span className="text-[10px] font-black tracking-widest uppercase opacity-50">
                                            {t.key}
                                        </span>
                                    </div>

                                    {isActive && (
                                        <m.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full"
                                        >
                                            <Check className="h-3 w-3 stroke-3" />
                                        </m.div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </PopoverContent>
            </Popover>
        </m.div>
    );
};
