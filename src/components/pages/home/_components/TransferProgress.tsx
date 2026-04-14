'use client';

import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
    Download,
    RefreshCw,
    Trash2,
    CheckCircle2,
    File,
    FileText,
    FileImage,
    FileVideo,
    FileArchive,
    FileAudio,
    FileCode,
    XCircle,
    ArrowUpRight,
    ArrowDownLeft,
} from 'lucide-react';
import { type TransferState } from '@/store/useTransferStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface TransferProgressProps {
    transferState: TransferState;
    onClear: () => void;
    onDeleteFile: (id: string) => void;
    onCancel: (id: string) => void;
}

const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'svg':
        case 'webp':
            return <FileImage className="h-5 w-5" />;
        case 'mp4':
        case 'mov':
        case 'avi':
        case 'mkv':
            return <FileVideo className="h-5 w-5" />;
        case 'pdf':
        case 'doc':
        case 'docx':
            return <FileText className="h-5 w-5" />;
        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gz':
            return <FileArchive className="h-5 w-5" />;
        case 'mp3':
        case 'wav':
        case 'ogg':
        case 'flac':
            return <FileAudio className="h-5 w-5" />;
        case 'js':
        case 'ts':
        case 'tsx':
        case 'jsx':
        case 'html':
        case 'css':
        case 'json':
        case 'py':
        case 'go':
        case 'rs':
            return <FileCode className="h-5 w-5" />;
        default:
            return <File className="h-5 w-5" />;
    }
};

export const TransferProgress = ({
    transferState,
    onClear,
    onDeleteFile,
    onCancel,
}: TransferProgressProps) => {
    const { t } = useTranslation();
    const handleDownloadAll = () => {
        transferState.files.forEach((file) => {
            if (
                file.type === 'received' &&
                file.status === 'completed' &&
                file.objectUrl
            ) {
                const a = document.createElement('a');
                a.href = file.objectUrl;
                a.download = file.fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        });
    };

    const completedFilesCount = transferState.files.filter(
        (f) => f.status === 'completed',
    ).length;

    const allCompleted =
        transferState.files.length > 0 &&
        transferState.files.every((f) => f.status === 'completed');

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
                <div className="flex flex-col">
                    <h3 className="text-primary/70 text-[10px] font-black tracking-[0.3em] uppercase">
                        {transferState.isReceiving
                            ? t('connected.incoming')
                            : t('connected.outgoing')}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                        <div className="from-primary to-accent h-1 w-8 rounded-full bg-linear-to-r" />
                        <span className="text-xs font-bold opacity-40">
                            {transferState.files.length} {t('connected.files')}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {transferState.files.some((f) => f.type === 'received') &&
                        completedFilesCount > 1 && (
                            <Button
                                size="sm"
                                variant="secondary"
                                className="bg-secondary/50 hover:bg-secondary/80 h-9 rounded-lg border px-4 text-[11px] font-bold tracking-wider uppercase transition-all"
                                onClick={handleDownloadAll}
                            >
                                <Download className="mr-2 h-3.5 w-3.5" />
                                {t('connected.download_all')}
                            </Button>
                        )}
                    {allCompleted && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 rounded-lg px-4 text-[11px] font-bold tracking-wider uppercase"
                            onClick={onClear}
                        >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            {t('connected.clear')}
                        </Button>
                    )}
                </div>
            </div>

            <div className="custom-scrollbar -mx-6 max-h-[400px] overflow-x-hidden overflow-y-auto px-6">
                <div className="space-y-4 px-2 pt-2 pb-8">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {transferState.files.map((file, _) => {
                            const isSuccess = file.status === 'completed';
                            const isTransferring =
                                file.status === 'transferring';
                            const isCancelled = file.status === 'cancelled';
                            const isError = file.status === 'error';

                            return (
                                <motion.div
                                    key={file.id}
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
                                        isSuccess &&
                                            'border-primary/20 bg-primary/5',
                                        isTransferring &&
                                            'border-accent/30 bg-accent/5',
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
                                                            title={
                                                                file.fileName
                                                            }
                                                        >
                                                            {file.fileName}
                                                        </p>
                                                        {file.type ===
                                                        'sent' ? (
                                                            <ArrowUpRight className="h-3 w-3 shrink-0 text-orange-500/60" />
                                                        ) : (
                                                            <ArrowDownLeft className="h-3 w-3 shrink-0 text-blue-500/60" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted-foreground/60 text-[10px] font-black tracking-widest uppercase">
                                                            {(
                                                                file.fileSize /
                                                                1024 /
                                                                1024
                                                            ).toFixed(2)}{' '}
                                                            MB
                                                        </span>
                                                        <span className="bg-border h-0.5 w-0.5 rounded-full" />
                                                        <span
                                                            className={cn(
                                                                'text-[10px] font-black tracking-widest uppercase',
                                                                file.type ===
                                                                    'sent'
                                                                    ? 'text-orange-500/70'
                                                                    : 'text-blue-500/70',
                                                            )}
                                                        >
                                                            {t(
                                                                `connected.${file.type}`,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex shrink-0 gap-1">
                                                    {(isTransferring ||
                                                        file.status ===
                                                            'pending') && (
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-8 rounded-lg transition-colors"
                                                            onClick={() =>
                                                                onCancel(
                                                                    file.id,
                                                                )
                                                            }
                                                        >
                                                            <XCircle className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}

                                                    {isSuccess && (
                                                        <div className="flex gap-1.5">
                                                            {file.type ===
                                                                'received' &&
                                                                file.objectUrl && (
                                                                    <Button
                                                                        size="icon"
                                                                        variant="secondary"
                                                                        asChild
                                                                        className="bg-secondary/50 hover:bg-secondary/80 size-8 rounded-lg border transition-all"
                                                                    >
                                                                        <a
                                                                            href={
                                                                                file.objectUrl
                                                                            }
                                                                            download={
                                                                                file.fileName
                                                                            }
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
                                                                    onDeleteFile(
                                                                        file.id,
                                                                    )
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
                                                                (isCancelled ||
                                                                    isError) &&
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
                                                            (isCancelled ||
                                                                isError) &&
                                                                'text-destructive',
                                                        )}
                                                    >
                                                        {Math.round(
                                                            file.progress,
                                                        )}
                                                        %
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
                                                            (isCancelled ||
                                                                isError) &&
                                                                'bg-destructive',
                                                            isSuccess &&
                                                                'bg-primary',
                                                        )}
                                                    />
                                                    {isTransferring && (
                                                        <motion.div
                                                            className="pointer-events-none absolute top-0 bottom-0 w-20 bg-white/30 blur-md"
                                                            animate={{
                                                                left: [
                                                                    '-20%',
                                                                    '120%',
                                                                ],
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
                        })}
                    </AnimatePresence>

                    {transferState.files.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4 py-16 text-center"
                        >
                            <div className="bg-muted/50 border-border/50 relative mx-auto flex size-16 items-center justify-center rounded-2xl border">
                                <File className="text-muted-foreground/40 h-6 w-6" />
                                <motion.div
                                    className="border-primary/20 absolute inset-0 rounded-2xl border"
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.3, 0, 0.3],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                    }}
                                />
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground/60 text-[10px] font-black tracking-[0.2em] uppercase">
                                    {t('connected.ready_for_data')}
                                </p>
                                <p className="text-muted-foreground/40 mx-auto max-w-[180px] text-[10px] leading-relaxed font-medium">
                                    {t('connected.drag_and_drop_hint')}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};
