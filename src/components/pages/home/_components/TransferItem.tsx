'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import {
    Download,
    RefreshCw,
    Trash2,
    CheckCircle2,
    XCircle,
    ArrowUpRight,
    ArrowDownLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { getFileIcon } from '@/utils/file-icons';
import { type FileTransfer } from '@/store/useTransferStore';

interface TransferItemProps {
    file: FileTransfer;
    onDeleteFile: (id: string) => void;
    onCancel: (id: string) => void;
}

export const TransferItem = memo(
    ({ file, onDeleteFile, onCancel }: TransferItemProps) => {
        const { t } = useTranslation();

        const isSuccess = file.status === 'completed';
        const isTransferring = file.status === 'transferring';
        const isCancelled = file.status === 'cancelled';
        const isError = file.status === 'error';

        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                    opacity: 0,
                    scale: 0.95,
                    transition: { duration: 0.2 },
                }}
                className={cn(
                    'group relative rounded-2xl border p-4 transition-all duration-500',
                    'bg-card/40 border-border/50',
                    isSuccess && 'border-primary/20 bg-primary/5',
                    isTransferring && 'border-accent/30 bg-accent/5',
                    (isCancelled || isError) &&
                        'border-destructive/20 bg-destructive/5 opacity-80',
                )}
            >
                {/* Animated background for transferring state */}
                {isTransferring && (
                    <motion.div
                        className="from-accent/5 to-primary/5 pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-r via-transparent"
                        animate={{
                            backgroundPosition: [
                                '0% 50%',
                                '100% 50%',
                                '0% 50%',
                            ],
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />
                )}

                <div className="relative z-10 flex items-start gap-4">
                    <div
                        className={cn(
                            'flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300',
                            isSuccess
                                ? 'bg-primary/20 text-primary'
                                : isTransferring
                                  ? 'bg-accent/20 text-accent animate-pulse'
                                  : isCancelled || isError
                                    ? 'bg-destructive/20 text-destructive'
                                    : 'bg-muted/50 text-muted-foreground',
                        )}
                    >
                        {isSuccess ? (
                            <CheckCircle2 className="h-5 w-5" />
                        ) : (
                            getFileIcon(file.fileName)
                        )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                    <p
                                        className="truncate text-[15px] leading-tight font-bold tracking-tight"
                                        title={file.fileName}
                                    >
                                        {file.fileName}
                                    </p>
                                    {file.type === 'sent' ? (
                                        <ArrowUpRight className="h-3 w-3 shrink-0 text-orange-500/60" />
                                    ) : (
                                        <ArrowDownLeft className="h-3 w-3 shrink-0 text-blue-500/60" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground/60 text-[10px] font-black tracking-widest uppercase">
                                        {(file.fileSize / 1024 / 1024).toFixed(
                                            2,
                                        )}{' '}
                                        MB
                                    </span>
                                    <span className="bg-border h-0.5 w-0.5 rounded-full" />
                                    <span
                                        className={cn(
                                            'text-[10px] font-black tracking-widest uppercase',
                                            file.type === 'sent'
                                                ? 'text-orange-500/70'
                                                : 'text-blue-500/70',
                                        )}
                                    >
                                        {t(`connected.${file.type}`)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex shrink-0 gap-1">
                                {(isTransferring ||
                                    file.status === 'pending') && (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-8 rounded-lg transition-colors"
                                        onClick={() => onCancel(file.id)}
                                    >
                                        <XCircle className="h-3.5 w-3.5" />
                                    </Button>
                                )}

                                {isSuccess && (
                                    <div className="flex gap-1.5">
                                        {file.type === 'received' &&
                                            file.objectUrl && (
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    asChild
                                                    className="bg-secondary/50 hover:bg-secondary/80 size-8 rounded-lg border transition-all"
                                                >
                                                    <a
                                                        href={file.objectUrl}
                                                        download={file.fileName}
                                                    >
                                                        <Download className="h-3.5 w-3.5" />
                                                    </a>
                                                </Button>
                                            )}
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-8 rounded-lg transition-colors"
                                            onClick={() =>
                                                onDeleteFile(file.id)
                                            }
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-end justify-between">
                                <div className="flex items-center gap-2">
                                    {isTransferring && (
                                        <RefreshCw className="text-accent h-3 w-3 animate-spin" />
                                    )}
                                    <span
                                        className={cn(
                                            'text-[10px] font-black tracking-[0.2em] uppercase',
                                            isSuccess
                                                ? 'text-primary'
                                                : 'text-muted-foreground/60',
                                            (isCancelled || isError) &&
                                                'text-destructive',
                                        )}
                                    >
                                        {t(
                                            `connected.status.${file.status}` as any,
                                        )}
                                    </span>
                                </div>
                                <span
                                    className={cn(
                                        'text-[11px] font-black tracking-wider tabular-nums',
                                        isSuccess
                                            ? 'text-primary'
                                            : 'text-primary/70',
                                        (isCancelled || isError) &&
                                            'text-destructive',
                                    )}
                                >
                                    {Math.round(file.progress)}%
                                </span>
                            </div>
                            <div className="group/progress relative">
                                <Progress
                                    value={file.progress}
                                    className="bg-muted/30 h-2 overflow-hidden rounded-full"
                                    indicatorClassName={cn(
                                        'transition-all duration-500 ease-out',
                                        isTransferring &&
                                            'from-primary to-accent bg-linear-to-r',
                                        (isCancelled || isError) &&
                                            'bg-destructive',
                                        isSuccess && 'bg-primary',
                                    )}
                                />
                                {isTransferring && (
                                    <motion.div
                                        className="pointer-events-none absolute top-0 bottom-0 w-20 bg-white/30 blur-md"
                                        animate={{
                                            left: ['-20%', '120%'],
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    },
);

TransferItem.displayName = 'TransferItem';
