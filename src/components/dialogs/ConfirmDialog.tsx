'use client';

import { GlassDialog } from '@/components/common/GlassDialog';
import { Button } from '../ui/button';
import { m } from 'framer-motion';
import { TriangleAlert, Info, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'destructive' | 'info' | 'warning' | 'default';

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
    variant?: Variant;
};

const RenderIcon = ({ variant }: { variant: Variant }) => {
    switch (variant) {
        case 'destructive':
            return <TriangleAlert className="text-destructive h-6 w-6" />;
        case 'warning':
            return <TriangleAlert className="text-warning h-6 w-6" />;
        case 'info':
            return <Info className="text-info h-6 w-6" />;
        default:
            return <HelpCircle className="text-primary h-6 w-6" />;
    }
};

const getGlowClass = (variant: Variant) => {
    switch (variant) {
        case 'destructive':
            return 'glow-destructive';
        case 'warning':
            return 'glow-secondary';
        case 'info':
            return 'glow-primary';
        default:
            return 'glow-primary';
    }
};

export default function ConfirmDialog({
    open,
    title,
    message,
    onConfirm,
    onOpenChange,
    confirmText,
    cancelText,
    variant = 'destructive',
}: ConfirmDialogProps) {
    const footer = (
        <>
            <m.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto"
            >
                <Button
                    variant="ghost"
                    className="bg-muted/30 hover:bg-muted/50 dark:bg-muted/10 h-12 w-full rounded-2xl px-8 font-bold transition-all sm:w-auto"
                    onClick={() => onOpenChange(false)}
                >
                    {cancelText}
                </Button>
            </m.div>
            <m.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95, y: 0 }}
                className="w-full sm:w-auto"
            >
                <Button
                    variant={
                        variant === 'destructive' ? 'destructive' : 'default'
                    }
                    className={cn(
                        'h-12 w-full rounded-2xl px-8 font-bold shadow-lg transition-all sm:w-auto',
                        getGlowClass(variant),
                    )}
                    onClick={() => {
                        onConfirm();
                        onOpenChange(false);
                    }}
                >
                    {confirmText}
                </Button>
            </m.div>
        </>
    );

    const headerContent = (
        <m.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={
                open ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }
            }
            transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: 0.1,
            }}
            className={cn(
                'bg-muted/50 flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner transition-colors',
                variant === 'destructive' && 'bg-destructive/10',
                variant === 'warning' && 'bg-warning/10',
                variant === 'info' && 'bg-info/10',
            )}
        >
            <RenderIcon variant={variant} />
        </m.div>
    );

    return (
        <GlassDialog
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description={message}
            headerContent={headerContent}
            footer={footer}
        >
            {/* ConfirmDialog doesn't need extra content in the body, everything is in header/footer */}
            <div />
        </GlassDialog>
    );
}
