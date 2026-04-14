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
                'group relative flex items-center gap-2 rounded-2xl p-2 transition-all duration-500',
                'border border-white/20 bg-white/10 backdrop-blur-md dark:border-white/5 dark:bg-black/10',
                'shadow-lg hover:bg-white/20 dark:hover:bg-white/10',
                className,
            )}
            aria-label={`Switch theme (current: ${theme})`}
        >
            <div className="flex-center relative h-6 w-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={theme}
                        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        <currentTheme.icon className="text-primary h-5 w-5" />
                    </motion.div>
                </AnimatePresence>
            </div>

            <span className="text-muted-foreground group-hover:text-foreground px-1 text-[10px] font-medium tracking-widest uppercase transition-colors duration-500">
                {currentTheme.label}
            </span>

            {/* Subtle glow effect */}
            <div className="bg-primary/10 absolute inset-0 -z-10 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
        </motion.button>
    );
};
