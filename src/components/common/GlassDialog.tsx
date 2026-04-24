'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
    DialogFooter,
} from '@/components/ui/dialog';
import { m, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type GlassDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    maxWidth?: string; // e.g., 'sm:max-w-md', 'sm:max-w-lg'
    className?: string;
    headerContent?: ReactNode; // For custom icons/animations in header
};

export function GlassDialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    maxWidth = 'sm:max-w-md',
    className,
    headerContent,
}: GlassDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    'glass border-border overflow-hidden rounded-3xl p-6 transition-all duration-300',
                    maxWidth,
                    className,
                )}
                showCloseButton={false}
            >
                {/* Custom Close Button with framer-motion */}
                <div className="absolute top-4 right-4 z-20">
                    <DialogClose asChild>
                        <m.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-muted-foreground hover:bg-muted/50 hover:text-foreground flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                        >
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </m.button>
                    </DialogClose>
                </div>

                {/* Decorative Background Elements */}
                <div className="bg-primary/10 pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl" />
                <div className="bg-secondary/10 pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full blur-3xl" />

                <AnimatePresence>
                    {open && (
                        <m.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 25,
                            }}
                            className="relative z-10 flex flex-col"
                        >
                            {(headerContent || title || description) && (
                                <DialogHeader className="mb-6 flex flex-col items-center gap-4 text-center">
                                    {headerContent}
                                    <div className="space-y-2">
                                        {title && (
                                            <DialogTitle className="font-heading text-2xl tracking-tight">
                                                {title}
                                            </DialogTitle>
                                        )}
                                        {description && (
                                            <DialogDescription className="text-muted-foreground text-balance">
                                                {description}
                                            </DialogDescription>
                                        )}
                                    </div>
                                </DialogHeader>
                            )}

                            <div className="flex-1">{children}</div>

                            {footer && (
                                <DialogFooter className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                                    {footer}
                                </DialogFooter>
                            )}
                        </m.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
