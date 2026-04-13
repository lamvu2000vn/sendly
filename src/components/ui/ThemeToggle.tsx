'use client';

import { useAppStore } from '@/store/useAppStore';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
    className?: string;
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
    const { theme, setTheme } = useAppStore();

    const themes = [
        { key: 'light', icon: Sun, label: 'Light' },
        { key: 'dark', icon: Moon, label: 'Dark' },
        { key: 'system', icon: Monitor, label: 'System' },
    ] as const;

    const toggleTheme = () => {
        const currentIndex = themes.findIndex((t) => t.key === theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex].key);
    };

    const currentTheme = themes.find((t) => t.key === theme) || themes[0];

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={cn(
                'group relative flex items-center gap-2 p-2 rounded-2xl transition-all duration-500',
                'bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/5',
                'hover:bg-white/20 dark:hover:bg-white/10 shadow-lg',
                className,
            )}
            aria-label={`Switch theme (current: ${theme})`}
        >
            <div className="relative w-6 h-6 flex-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={theme}
                        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        <currentTheme.icon className="w-5 h-5 text-primary" />
                    </motion.div>
                </AnimatePresence>
            </div>

            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors duration-500 px-1">
                {currentTheme.label}
            </span>

            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-primary/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />
        </motion.button>
    );
};
