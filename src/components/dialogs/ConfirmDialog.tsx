import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { TriangleAlert, Info, HelpCircle, X } from 'lucide-react';
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
            return 'glow-secondary'; // Dùng secondary cho warning để đồng bộ pastel
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
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="glass border-border overflow-hidden rounded-3xl p-6 sm:max-w-md"
                showCloseButton={false}
            >
                {/* Custom Close Button */}
                <div className="absolute top-4 right-4 z-20">
                    <DialogClose asChild>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-muted-foreground hover:bg-muted/50 hover:text-foreground flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                        >
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </motion.button>
                    </DialogClose>
                </div>

                {/* Decorative Background Elements */}
                <div className="bg-primary/10 pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl" />
                <div className="bg-secondary/10 pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full blur-3xl" />

                <DialogHeader className="relative z-10 flex flex-col items-center gap-4 text-center">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={
                            open
                                ? { scale: 1, opacity: 1 }
                                : { scale: 0.5, opacity: 0 }
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
                    </motion.div>

                    <div className="space-y-2">
                        <DialogTitle className="font-heading text-2xl tracking-tight">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-balance">
                            {message}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <DialogFooter className="relative z-10 mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <motion.div
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
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95, y: 0 }}
                        className="w-full sm:w-auto"
                    >
                        <Button
                            variant={
                                variant === 'destructive'
                                    ? 'destructive'
                                    : 'default'
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
                    </motion.div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
